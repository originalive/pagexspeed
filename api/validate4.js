export default async function handler(req, res) {
  // ✅ CORS Headers for Extension
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  // ✅ Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // ✅ Only allow POST for all endpoints
  if (req.method !== "POST") {
    return res.status(405).json({
      status: false,
      message: "Method Not Allowed. Use POST only.",
    });
  }

  // ✅ Get route path
  const path = req.url.split("?")[0];

  // 1️⃣ /authencate → 307 redirect to /validate4
  if (path.includes("/authencate")) {
    res.writeHead(307, {
      Location: "https://speedxorigin.vercel.app/api/validate4"
    });
    return res.end();
  }

  // 2️⃣ /validate4 → Simulated license success
  if (path.includes("/validate4")) {
    const { key, mac } = req.body || {};

    if (!key || !mac) {
      return res.status(400).json({
        status: false,
        message: "License key and Device ID are required.",
      });
    }

    return res.status(200).json({
      status: true,
      success: true,
      valid: true,
      data: {
        leftDays: 30,
        appVersion: "6.20.10",
        ipList: "192.168.1.1,10.0.0.1",
        shortMessage: "Your license is active and ready!",
        News: "Welcome to SpeedX! New features coming soon.",
        keyType: "monthly",
        payment: true,
        automation: true,
        autoStart: true,
        activationKey: key,
        deviceId: mac
      }
    });
  }

  // 3️⃣ /process-auth → Final automation trigger
  if (path.includes("/process-auth")) {
    const { key, mac } = req.body || {};
    return res.status(200).json({
      status: "ok",
      data: {
        leftDays: 999,
        keyType: "monthly",
        appVersion: "6.20.10",
        message: "Automation triggered successfully",
        key: key || "demo",
        mac: mac || "demo-mac"
      }
    });
  }

  // ❌ Fallback for unknown paths
  return res.status(404).json({
    status: false,
    message: "Unknown API endpoint"
  });
}
