export default async function handler(req, res) {
  // ✅ CORS Headers — allow everything
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  // ✅ Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(204).end(); // Preflight successful
  }

  // ✅ Reject anything but POST
  if (req.method !== "POST") {
    return res.status(405).json({
      status: false,
      success: false,
      valid: false,
      message: "Only POST allowed"
    });
  }

  try {
    // ✅ Debug log: headers + body
    console.log("🔍 Headers:", req.headers);
    console.log("🔍 Body:", req.body);

    const { key, mac } = req.body || {};

    // ✅ Accept even if key/mac are missing (for brute-force testing)
    // You can uncomment validation if needed later:
    // if (!key || !mac) {
    //   return res.status(400).json({
    //     status: false,
    //     message: "License key and Device ID are required.",
    //   });
    // }

    // ✅ Simulated success response with ALL POSSIBLE KEYS
    return res.status(200).json({
      success: true,             // ✅ some systems expect this
      status: true,              // ✅ others check this
      valid: true,               // ✅ just in case
      code: 200,                 // ✅ some bundles check `code === 200`
      message: "Verified",       // ✅ generic pass message
      token: "fake-token-value", // ✅ if they expect a token

      // ✅ headers echo (for debug, remove in prod)
      requestAccessToken: req.headers["access-token"] || null,

      data: {
        leftDays: 30,
        appVersion: "6.20.10",
        ipList: "127.0.0.1,192.168.1.1",
        shortMessage: "Your license is active and valid!",
        News: "🔥 SpeedX — Now powered via redirect!",
        keyType: "monthly",
        payment: true,
        automation: true,       // ✅ possible trigger field
        autoStart: true,        // ✅ some tools use this
        validUntil: "2099-12-31"
      }
    });
  } catch (err) {
    console.error("🔥 Server Error:", err);
    return res.status(500).json({
      success: false,
      status: false,
      valid: false,
      message: "Internal error during validation."
    });
  }
}
