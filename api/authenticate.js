import { Buffer } from "buffer";

const LICENSES_URL = "https://api.github.com/repos/originalive/verify/contents/licenses.json";

// Helper for consistent responses
const send = (res, code, body) => res.status(code).json(body);

export default async function validate(req, res) {
  if (req.method !== "POST")
    return send(res, 405, { error: "Method not allowed" });

  const { key, clientId } = req.body;
  if (!key || !clientId)
    return send(res, 400, { error: "Key and clientId are required" });

  try {
    const pat = process.env.GITHUB_BLUEBERRY;
    if (!pat) return send(res, 500, { error: "Server configuration error" });

    // 🔑 Fetch licenses from GitHub
    const response = await fetch(LICENSES_URL, {
      headers: { Authorization: `token ${pat}`, Accept: "application/json" },
    });
    if (!response.ok)
      return send(res, 500, { error: "Failed to fetch license data" });

    const data = await response.json();
    const licenses = JSON.parse(
      Buffer.from(data.content, "base64").toString()
    );

    const license = licenses.find((l) => l.key === key);
    if (!license)
      return send(res, 400, { success: false, message: "Invalid license key" });

    const now = new Date();
    const indianTime = now.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    let updated = false;

    // First activation
    if (!license.activatedDate) {
      Object.assign(license, {
        activatedDate: indianTime,
        clientIds: [],
        loginCount: 0,
      });
      updated = true;
    }

    // Expiry check
    const startDate = new Date(
      license.activatedDate.split(", ")[0].split("/").reverse().join("-")
    );
    const daysPassed = Math.floor(
      (now - startDate) / (1000 * 60 * 60 * 24)
    );
    const daysLeft = Math.max(0, license.validityDays - daysPassed);

    if (daysLeft === 0)
      return send(res, 403, {
        success: false,
        expired: true,
        message: "Key expired. Purchase a new key or extend it.",
      });

    // Client binding (multi-instance support)
    const maxInstances = license.maxInstances || 1;
    if (!license.clientIds.includes(clientId)) {
      if (license.clientIds.length >= maxInstances)
        return send(res, 400, {
          success: false,
          message: `Maximum instances (${maxInstances}) reached`,
        });
      license.clientIds.push(clientId);
      updated = true;
    }

    // Update login info
    license.loginCount += 1;
    license.lastLogin = indianTime;
    updated = true;

    if (updated) await updateLicenseFile(licenses, data.sha, pat);

    return send(res, 200, {
      success: true,
      expired: false,
      message: "License valid",
      daysLeft,
    });
  } catch (err) {
    console.error("Server error:", err);
    return send(res, 500, { error: "Internal server error" });
  }
}

async function updateLicenseFile(licenses, sha, pat) {
  const response = await fetch(LICENSES_URL, {
    method: "PUT",
    headers: { Authorization: `token ${pat}`, Accept: "application/json" },
    body: JSON.stringify({
      message: "Update license data",
      content: Buffer.from(JSON.stringify(licenses, null, 2)).toString("base64"),
      sha,
    }),
  });

  if (!response.ok) throw new Error("Failed to update license file");
}
