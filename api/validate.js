export default async function validate(req, res) {
  // Restrict to POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate request body
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const { key, clientId } = req.body;
  // Validate key and clientId (basic format check; adjust regex as needed)
  if (
    !key ||
    !clientId ||
    typeof key !== 'string' ||
    typeof clientId !== 'string' ||
    key.length < 1 ||
    clientId.length < 1 ||
    !/^[a-zA-Z0-9_-]+$/.test(key) ||
    !/^[a-zA-Z0-9+=/]+$/.test(clientId) // Allow base64 for clientId
  ) {
    return res.status(400).json({ error: 'Key and clientId must be valid non-empty strings' });
  }

  try {
    // Retrieve GitHub PAT
    const pat = process.env.GITHUB_BLUEBERRY;
    if (!pat) {
      console.error('GitHub PAT is not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    let needsUpdate = false;

    // Fetch licenses.json from GitHub
    let response;
    try {
      response = await fetch('https://api.github.com/repos/originalive/verify/contents/licenses.json', {
        headers: {
          'Authorization': `token ${pat}`,
          'Accept': 'application/json',
        },
      });
    } catch (error) {
      console.error('Fetch error:', error);
      return res.status(500).json({ error: 'Failed to connect to license server' });
    }

    if (!response.ok) {
      console.error('GitHub API error:', response.status);
      return res.status(500).json({ error: 'Failed to fetch license data' });
    }

    const data = await response.json();
    let licenses;
    try {
      licenses = JSON.parse(Buffer.from(data.content, 'base64').toString());
    } catch (error) {
      console.error('Failed to parse licenses.json:', error);
      return res.status(500).json({ error: 'Corrupted license data' });
    }

    if (!Array.isArray(licenses)) {
      console.error('licenses.json is not an array');
      return res.status(500).json({ error: 'Invalid license data format' });
    }

    // Find license (case-insensitive)
    const license = licenses.find((l) => l.key && l.key.toLowerCase() === key.toLowerCase());
    if (!license) {
      return res.status(400).json({ success: false, message: 'Invalid license key' });
    }

    // Validate license structure
    if (!Array.isArray(license.clientIds)) {
      license.clientIds = [];
      needsUpdate = true;
    }
    if (!Number.isInteger(license.loginCount)) {
      license.loginCount = 0;
      needsUpdate = true;
    }
    if (!Number.isInteger(license.daysLeft)) {
      license.daysLeft = license.initialDays || 30;
      needsUpdate = true;
    }
    if (typeof license.isExpired !== 'boolean') {
      license.isExpired = false;
      needsUpdate = true;
    }

    // Check if license is expired
    if (license.isExpired) {
      return res.status(400).json({ success: false, message: 'License key has expired' });
    }

    // Validate clientId binding
    const maxInstances = Number.isInteger(license.maxInstances) && license.maxInstances > 0 ? license.maxInstances : 1;
    if (!license.clientIds.includes(clientId)) {
      if (license.clientIds.length >= maxInstances) {
        return res.status(400).json({
          success: false,
          message: `License key is bound to maximum allowed instances (${maxInstances})`,
        });
      }
      license.clientIds.push(clientId);
      needsUpdate = true;
    }

    // Initialize firstUsed if invalid or missing
    if (!license.firstUsed || isNaN(new Date(license.firstUsed))) {
      license.firstUsed = new Date().toISOString();
      needsUpdate = true;
    }

    // Calculate days left only if the date has changed
    const firstUsedDate = new Date(license.firstUsed);
    const currentDate = new Date();
    const daysSinceFirstUse = Math.max(0, Math.floor((currentDate - firstUsedDate) / (1000 * 60 * 60 * 24)));
    const initialDays = Number.isInteger(license.initialDays) && license.initialDays > 0 ? license.initialDays : 30;
    const lastChecked = license.lastChecked && !isNaN(new Date(license.lastChecked)) ? new Date(license.lastChecked) : null;
    if (!lastChecked || lastChecked.toDateString() !== currentDate.toDateString()) {
      license.daysLeft = Math.max(0, initialDays - daysSinceFirstUse);
      license.lastChecked = currentDate.toISOString();
      if (license.daysLeft === 0) {
        license.isExpired = true;
      }
      needsUpdate = true;
    }

    // Increment login count
    license.loginCount += 1;
    needsUpdate = true;

    // Update licenses.json with retry logic
    if (needsUpdate) {
      try {
        await updateLicenseFile(licenses, data.sha, pat);
      } catch (error) {
        console.error('Failed to update license file:', error);
        return res.status(500).json({ error: 'Failed to save license changes' });
      }
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'License validated!',
      daysLeft: license.daysLeft,
      loginCount: license.loginCount,
      isExpired: license.isExpired,
      maxInstances: maxInstances,
      boundInstances: license.clientIds.length,
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateLicenseFile(licenses, sha, pat, retries = 3) {
  try {
    const response = await fetch('https://api.github.com/repos/originalive/verify/contents/licenses.json', {
      method: 'PUT',
      headers: {
        'Authorization': `token ${pat}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        message: 'Update license data',
        content: Buffer.from(JSON.stringify(licenses, null, 2)).toString('base64'),
        sha: sha,
      }),
    });

    if (!response.ok) {
      if (response.status === 409 && retries > 0) {
        // Fetch the latest SHA to retry
        const latestResponse = await fetch('https://api.github.com/repos/originalive/verify/contents/licenses.json', {
          headers: {
            'Authorization': `token ${pat}`,
            'Accept': 'application/json',
          },
        });
        if (!latestResponse.ok) {
          throw new Error('Failed to fetch latest license data for retry');
        }
        const latestData = await latestResponse.json();
        return updateLicenseFile(licenses, latestData.sha, pat, retries - 1);
      }
      const errorData = await response.json();
      throw new Error(`GitHub API error: ${response.status} - ${errorData.message}`);
    }
  } catch (error) {
    throw new Error(`GitHub update failed: ${error.message}`);
  }
}
