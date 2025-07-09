export default async function handler(req, res) {
  // ✅ CORS Headers — allow everything for extension
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  // ✅ Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(204).end(); // Preflight successful
  }

  // ✅ Reject non-POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      status: false,
      success: false,
      valid: false,
      message: "Only POST allowed",
    });
  }

  try {
    // ✅ Log headers and body for inspection
    console.log("🔍 Incoming Headers:", req.headers);
    console.log("🔍 Incoming Body:", req.body);

    const { key, mac } = req.body || {};

    // ✅ Send ultra-compatible brute-force response
    return res.status(200).json({
      // Top-level flags
      success: true,
      status: true,
      valid: true,
      verified: true,
      result: "pass",
      code: 200,
      message: "Access granted",
      license: "active",
      response: "ok",
      token: "fake-token-from-vercel",
      ready: true,
      automation: true,
      autoStart: true,
      enabled: true,
      requestAccessToken: req.headers["access-token"] || null,

      // Deep payload
      data: {
        leftDays: 3650,
        appVersion: "6.20.10",
        version: "6.20.10",
        ipList: "127.0.0.1,192.168.1.1",
        keyType: "monthly",
        keyStatus: "active",
        payment: true,
        automationStatus: "enabled",
        triggerAutomation: true,
        autoTrigger: true,
        verified: true,
        licenseCheck: true,
        validUntil: "2099-12-31T23:59:59Z",
        activationKey: key || "demo-key",
        deviceId: mac || "demo-mac",
        user: "testuser@example.com",
        plan: "pro",
        country: "IN",
        shortMessage: "License OK!",
        longMessage: "Welcome! Automation unlocked.",
        instructions: "Enjoy your features",
        responseMessage: "Authenticated",
        expiresAt: "2099-12-31T23:59:59.999Z"
      }
    });
  } catch (err) {
    console.error("🔥 Server Error:", err);
    return res.status(500).json({
      success: false,
      status: false,
      valid: false,
      message: "Internal error during validation",
      error: err.message || "Unknown error"
    });
  }
}
