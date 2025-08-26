export default async function handler(req, res) {
  // ✅ CORS Headers (matching the actual API response)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Cache-Control", "no-cache, private");
  res.setHeader("Vary", "Authorization");
  
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
    // ✅ Extract required headers
    const accessToken = req.headers['access-token'];
    const authorization = req.headers['authorization'];
    
    // ✅ Accept any token provided (no validation)

    // ✅ Parse request body
    const { psg_data } = req.body;

    // ✅ Validate passenger data
    if (!psg_data) {
      return res.status(400).json({
        status: false,
        message: "Passenger data is required.",
      });
    }

    // ✅ Parse and validate passenger data format
    let passengerData;
    try {
      passengerData = JSON.parse(psg_data);
      if (!Array.isArray(passengerData) || passengerData.length === 0) {
        throw new Error("Invalid passenger data format");
      }
    } catch (error) {
      return res.status(400).json({
        status: false,
        message: "Invalid passenger data format. Expected JSON array.",
      });
    }

    // ✅ Generate payment signature (64-character hex string)
    const generateSignature = () => {
      const chars = '0123456789abcdef';
      let result = '';
      for (let i = 0; i < 64; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
      return result;
    };

    // ✅ Response matching the actual API format
    return res.status(200).json({
      status: true,
      message: "Payment process has been created successfully.",
      data: {
        is_process: false,
        signature: generateSignature()
      }
    });

  } catch (error) {
    console.error("Payment process error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error during payment processing."
    });
  }
}
