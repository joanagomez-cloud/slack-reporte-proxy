export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const SLACK_WEBHOOK = "https://hooks.slack.com/services/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";

  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    const slackRes = await fetch(SLACK_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    const slackBody = await slackRes.text();

    if (slackRes.ok) {
      res.status(200).json({ ok: true });
    } else {
      res.status(500).json({ error: slackBody });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
