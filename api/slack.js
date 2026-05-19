export const config = { api: { bodyParser: true } };

const SYSTEM_PROMPT = `Eres un asistente que analiza transcripciones de reuniones o sesiones relacionadas con sistemas de seguridad GPS y rastreo vehicular.

Tu tarea es identificar y reportar CUALQUIERA de estas situaciones:

1. PROBLEMAS DE INSTALACIÓN: Instalaciones deficientes, incompletas, apresuradas, mal ejecutadas.
2. REVISIÓN DE UNIDAD: Cualquier unidad, cámara o equipo inactivo, con fallas, sin reportar, o que necesite revisión. Incluye placa o número.
3. QUEJAS EXTERNAS: Inconformidades sobre el servicio, atención, tiempos de respuesta, o comentarios negativos.

Formato del reporte:

REUNIÓN – [PLATAFORMA] – [CLIENTE] – [FECHA]

• [punto 1]
• [punto 2]
...

Al final incluye:
🔖 Categorías: [las que apliquen: Problema de instalación / Revisión de unidad / Queja externa]

Solo responde "SIN_PROBLEMAS" si no hay absolutamente ningún problema.`;

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
    const body = req.body || {};
    const plataforma = body.plataforma;
    const cliente = body.cliente;
    const fecha = body.fecha;
    const transcripcion = body.transcripcion;

    if (!transcripcion) {
      return res.status(400).json({ error: "No transcripcion provided", body: JSON.stringify(body) });
    }

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

    const slackBody = await slackRes.text();

    if (slackRes.ok) {
      return res.status(200).json({ status: "enviado", reporte: reportText });
    } else {
      return res.status(500).json({ error: slackBody });
    }

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}export const config = { api: { bodyParser: true } };

const SYSTEM_PROMPT = `Eres un asistente que analiza transcripciones de reuniones o sesiones relacionadas con sistemas de seguridad GPS y rastreo vehicular.

Tu tarea es identificar y reportar CUALQUIERA de estas situaciones:

1. PROBLEMAS DE INSTALACIÓN: Instalaciones deficientes, incompletas, apresuradas, mal ejecutadas.
2. REVISIÓN DE UNIDAD: Cualquier unidad, cámara o equipo inactivo, con fallas, sin reportar, o que necesite revisión. Incluye placa o número.
3. QUEJAS EXTERNAS: Inconformidades sobre el servicio, atención, tiempos de respuesta, o comentarios negativos.

Formato del reporte:

REUNIÓN – [PLATAFORMA] – [CLIENTE] – [FECHA]

• [punto 1]
• [punto 2]
...

Al final incluye:
🔖 Categorías: [las que apliquen: Problema de instalación / Revisión de unidad / Queja externa]

Solo responde "SIN_PROBLEMAS" si no hay absolutamente ningún problema.`;

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
    const body = req.body || {};
    const plataforma = body.plataforma;
    const cliente = body.cliente;
    const fecha = body.fecha;
    const transcripcion = body.transcripcion;

    if (!transcripcion) {
      return res.status(400).json({ error: "No transcripcion provided", body: JSON.stringify(body) });
    }

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

    const slackBody = await slackRes.text();

    if (slackRes.ok) {
      return res.status(200).json({ status: "enviado", reporte: reportText });
    } else {
      return res.status(500).json({ error: slackBody });
    }

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
