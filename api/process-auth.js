export default async function handler(req, res) {
  // ✅ CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  // ✅ Preflight request
  if (req.method === "OPTIONS") {
    return res.status(204).end();
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

    // ✅ Simulated token (can be any string)
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fakeTokenPayload.signature";

    // ✅ Response payload
    return res.status(200).json({
      status: true,
      message: "Your key is active and ready to go.",
      data: {
        leftDays: 31,
        appVersion: "6.20.24",
        payment: true,
        shortMessage: "💥💥Doctor Doom Pahle Se Fast Update Kar Diya Gaya Hai @@@\n🧬‍♀️ Panel Servar Issue Ke Karan Aaj Working Issue Tha Update Sevar Done\n💫💫 Best Payment Qr Irctc or Paytm QR@@@\nPhonepay QR   Booking Best @@@ @@@\n\nOnly Booking Time Use kare Faltu Test Mat kare @@@ @@@\nHamara Auto Update Funcation Hai Kush vi Update ayega to mil jayega",
        keyType: "MONTHLY",
        token: token
      }
    });
  } catch (error) {
    console.error("Auth processing error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error during auth processing."
    });
  }
}
