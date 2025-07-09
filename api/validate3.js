// Server-side code for Vercel API endpoint (e.g., /api/validate3)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: false,
      message: 'Method Not Allowed.'
    });
  }

  const { key, mac } = req.body;

  if (!key || !mac) {
    return res.status(400).json({
      status: false,
      message: 'License key and Device ID are required.'
    });
  }

  // Simulate a successful license validation
  return res.status(200).json({
    status: true,
    data: {
      leftDays: 30, // Example: 30 days left
      appVersion: "6.20.10",
      ipList: "192.168.1.1,10.0.0.1",
      shortMessage: "Your license is active and ready!",
      News: "Welcome to SpeedX! New features coming soon.",
      keyType: "monthly",
      payment: true
    }
  });
}
