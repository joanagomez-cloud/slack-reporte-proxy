export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const SLACK_WEBHOOK = "https://hooks.slack.com/services/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";

  try {
    const { text } = req.body;
    const slackRes = await fetch(SLACK_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    if (slackRes.ok) {
      res.status(200).json({ ok: true });
    } else {
      res.status(500).json({ error: "Error enviando a Slack" });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
