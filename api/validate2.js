export default async function validate(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { key } = req.body;
  if (!key)
    return res
      .status(400)
      .json({ success: false, message: "License key required." });

  try {
    // 1️⃣  Fetch license file from GitHub
    const pat = process.env.GITHUB_BLUEBERRY;
    const response = await fetch(
      "https://api.github.com/repos/originalive/verify/contents/licenses.json",
      {
        headers: {
          Authorization: `token ${pat}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch license file.");

    const data = await response.json();
    const decoded = Buffer.from(data.content, "base64").toString("utf8");
    const licenseObject = JSON.parse(decoded);
    const licenses = licenseObject.licenses || [];

    // 2️⃣  Case-insensitive match
    const found = licenses.find(
      (l) => l.key.toLowerCase() === key.toLowerCase()
    );

    // 3️⃣  Respond plainly
    if (found) {
      return res.status(200).json({
        success: true,
        message: "Valid license.",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Invalid license key.",
      });
    }
  } catch (error) {
    console.error("Validation Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
}
