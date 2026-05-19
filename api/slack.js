export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK;

  if (!ANTHROPIC_API_KEY || !SLACK_WEBHOOK) {
    return res.status(500).json({ error: "Missing environment variables" });
  }

  try {
    const { plataforma, cliente, fecha, transcripcion } = req.body;

    if (!transcripcion) {
      return res.status(400).json({ error: "No transcripcion provided", received: JSON.stringify(req.body) });
    }

    const SYSTEM_PROMPT = `Eres un asistente que analiza transcripciones de reuniones relacionadas con sistemas de seguridad GPS. Detecta y reporta: 1. PROBLEMAS DE INSTALACIÓN, 2. REVISIÓN DE UNIDAD (incluye placa), 3. QUEJAS EXTERNAS. Formato: REUNIÓN – [PLATAFORMA] – [CLIENTE] – [FECHA] seguido de puntos con viñetas y al final 🔖 Categorías. Solo responde SIN_PROBLEMAS si no hay ningún problema.`;

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{
          role: "user",
          content: `Plataforma: ${plataforma || "[PLATAFORMA]"}\nCliente: ${cliente || "[CLIENTE]"}\nFecha: ${fecha || "[FECHA]"}\n\nTranscripción:\n${transcripcion}`
        }]
      })
    });

    const aiData = await aiRes.json();
    const reportText = aiData.content?.find(b => b.type === "text")?.text?.trim() || "";

    if (reportText === "SIN_PROBLEMAS") {
      return res.status(200).json({ status: "sin_problemas" });
    }

    const slackRes = await fetch(SLACK_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: reportText })
    });

    if (slackRes.ok) {
      return res.status(200).json({ status: "enviado", reporte: reportText });
    } else {
      const slackBody = await slackRes.text();
      return res.status(500).json({ error: slackBody });
    }

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
