export default async function handler(req, res) {
  // ✅ Always send CORS headers (for both OPTIONS and real requests)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Respond to preflight requests (CORS OPTIONS)
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // ✅ Only allow POST method
  if (req.method !== "POST") {
    return res.status(405).json({
      status: false,
      message: "Method Not Allowed. Only POST is supported.",
    });
  }

  try {
    // ✅ Parse JSON body
    const { key, mac } = req.body;

    // ✅ Validate input
    if (!key || !mac) {
      return res.status(400).json({
        status: false,
        message: "License key and Device ID are required.",
      });
    }

    // ✅ Simulate validation logic (customize as needed)
    // For real apps, validate key/mac here (DB, API, etc.)

    return res.status(200).json({
      status: true,
      data: {
        leftDays: 30, // Example: 30 days left
        appVersion: "6.20.10",
        ipList: "192.168.1.1,10.0.0.1",
        shortMessage: "Your license is active and ready!",
        News: "Welcome to SpeedX! New features coming soon.",
        keyType: "monthly",
        payment: true,
      },
    });
  } catch (err) {
    // ✅ Handle unexpected errors
    console.error("Validation error:", err);
    return res.status(500).json({
      status: false,
      message: "Server error during validation.",
    });
  }
}
