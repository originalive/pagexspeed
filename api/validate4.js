export default async function handler(req, res) {
  // ✅ CORS headers — universal allow
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  // ✅ Preflight (OPTIONS)
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // ✅ 👇 Redirect logic (simulates server-side 307)
  if (req.url === "/api/v1/process-auth") {
    res.writeHead(307, {
      Location: "https://speedxorigin.vercel.app/api/validate4"
    });
    return res.end();
  }

  // ✅ Only allow POST to main endpoint
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      status: false,
      valid: false,
      message: "Only POST method is allowed",
    });
  }

  try {
    // ✅ Extract headers and body fields
    const accessToken = req.headers["access-token"] || null;
    const userAgent = req.headers["user-agent"] || "Unknown";

    const { key, mac, email, machine } = req.body || {};

    // ✅ Simulated success payload
    const responsePayload = {
      success: true,
      status: true,
      valid: true,
      verified: true,
      code: 200,
      token: "vercel-bypass-token",
      message: "License validated successfully",

      // ✅ Automation triggers
      automation: true,
      autoStart: true,
      autoTrigger: true,
      enabled: true,

      // ✅ License & system info
      paid: true,
      payment: true,
      leftDays: 3650,
      validUntil: "2099-12-31",
      keyType: "lifetime",
      appVersion: "9.99.99",

      // ✅ UI messages
      shortMessage: "✅ License active. Automation enabled.",
      longMessage: "Welcome to SpeedX Pro! All systems go.",
      News: "🚀 Update: Bundled with redirect support.",
      ipList: "127.0.0.1,192.168.0.1",

      // ✅ Echo debug info
      request: {
        accessToken,
        userAgent,
        key,
        mac,
        email,
        machine,
        headers: req.headers
      }
    };

    return res.status(200).json(responsePayload);

  } catch (err) {
    console.error("🔥 Server Error:", err);
    return res.status(500).json({
      success: false,
      status: false,
      valid: false,
      message: "Internal error during validation",
      error: err.message || "Unknown failure"
    });
  }
}
