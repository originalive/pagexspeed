export default async function handler(req, res) {
  // ✅ CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*"); // Extension-friendly
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allow methods
  res.setHeader("Access-Control-Allow-Headers", "*"); // Allow ALL headers (including access-token, etc.)

  // ✅ Preflight request (OPTIONS)
  if (req.method === "OPTIONS") {
    return res.status(204).end(); // No content for preflight
  }

  // ✅ Block unsupported methods
  if (req.method !== "POST") {
    return res.status(405).json({
      status: false,
      message: "Method Not Allowed. Use POST only.",
    });
  }

  try {
    // ✅ Parse request body
    const { key, mac } = req.body;

    // ✅ Input validation
    if (!key || !mac) {
      return res.status(400).json({
        status: false,
        message: "License key and Device ID are required.",
      });
    }

    // ✅ Simulated license check response
    return res.status(200).json({
      status: true,
      data: {
        leftDays: 30,
        appVersion: "6.20.24",
        ipList: "192.168.1.1,10.0.0.1",
        shortMessage: "Your license is active and ready!",
        News: "Welcome to SpeedX! New features coming soon.",
        keyType: "monthly",
        payment: true
      }
    });
  } catch (error) {
    console.error("License validation error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error during validation."
    });
  }
}
