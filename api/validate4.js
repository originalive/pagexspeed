export default async function handler(req, res) {
  // ✅ CORS Headers — allow everything
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  // ✅ Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // ✅ Reject non-POST methods
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      status: false,
      valid: false,
      message: "Only POST method is allowed",
    });
  }

  try {
    // ✅ Extract values from headers and body
    const accessToken = req.headers["access-token"] || null;
    const userAgent = req.headers["user-agent"] || "Unknown";

    const { key, mac, email, machine } = req.body || {};

    // ✅ Simulated license validation response
    const responsePayload = {
      success: true,                   // ✅ General success
      status: true,                    // ✅ Extra success flag
      valid: true,                     // ✅ For strict validation
      verified: true,                  // ✅ Some bundles check this
      code: 200,                       // ✅ Numeric status
      token: "fake-token-" + Math.random().toString(36).substring(2),
      message: "License validated successfully",

      // ✅ Automation triggers
      automation: true,
      autoStart: true,
      autoTrigger: true,
      enabled: true,

      // ✅ License details
      paid: true,
      payment: true,
      leftDays: 999,
      validUntil: "2099-12-31",
      keyType: "lifetime",
      appVersion: "9.99.99",

      // ✅ UI/UX messages
      shortMessage: "✅ Welcome back! Everything is unlocked.",
      longMessage: "Your subscription is active and all features are available.",
      News: "🔥 New update: Obfuscation bypass supported.",
      ipList: "127.0.0.1,192.168.0.1",

      // ✅ Echo inputs for inspection
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

    // ✅ Return response
    return res.status(200).json(responsePayload);

  } catch (err) {
    // ❌ Internal server error fallback
    console.error("🔥 Validation error:", err);
    return res.status(500).json({
      success: false,
      status: false,
      valid: false,
      message: "Internal server error",
      error: err.message || "Unknown error"
    });
  }
}
