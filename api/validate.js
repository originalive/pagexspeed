export default async function validate(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const { key, clientId } = req.body;
  
  if (!key || !clientId || typeof key !== 'string' || typeof clientId !== 'string') {
    return res.status(400).json({ error: 'Key and clientId are required' });
  }

  try {
    const pat = process.env.GITHUB_BLUEBERRY;
    if (!pat) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Fetch licenses from GitHub
    const response = await fetch('https://api.github.com/repos/originalive/verify/contents/licenses.json', {
      headers: {
        'Authorization': `token ${pat}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to fetch license data' });
    }

    const data = await response.json();
    const licenses = JSON.parse(Buffer.from(data.content, 'base64').toString());

    // Find license
    const license = licenses.find((l) => l.key && l.key.toLowerCase() === key.toLowerCase());
    if (!license) {
      return res.status(400).json({ 
        success: false, 
        expired: false,
        message: 'Invalid license key' 
      });
    }

    let needsUpdate = false;

    // Initialize fields if missing
    if (!Array.isArray(license.clientIds)) {
      license.clientIds = [];
      needsUpdate = true;
    }
    if (!Number.isInteger(license.loginCount)) {
      license.loginCount = 0;
      needsUpdate = true;
    }

    // Set firstUsed if not exists
    if (!license.firstUsed) {
      license.firstUsed = new Date().toISOString();
      needsUpdate = true;
    }

    // Calculate days left
    const firstUsedDate = new Date(license.firstUsed);
    const currentDate = new Date();
    const daysSinceFirstUse = Math.floor((currentDate - firstUsedDate) / (1000 * 60 * 60 * 24));
    const initialDays = license.initialDays || 30;
    const calculatedDaysLeft = Math.max(0, initialDays - daysSinceFirstUse);

    // Update days left
    if (license.daysLeft !== calculatedDaysLeft) {
      license.daysLeft = calculatedDaysLeft;
      needsUpdate = true;
    }

    // Set expired flag if days = 0
    if (license.daysLeft === 0) {
      license.isExpired = true;
      needsUpdate = true;
    }

    // **BLOCK ACCESS IF EXPIRED**
    if (license.isExpired || license.daysLeft === 0) {
      if (needsUpdate) {
        await updateLicenseFile(licenses, data.sha, pat);
      }
      
      return res.status(403).json({ 
        success: false, 
        expired: true,
        message: 'License expired. Purchase new license.',
        daysLeft: 0
      });
    }

    // Check client binding
    const maxInstances = license.maxInstances || 1;
    if (!license.clientIds.includes(clientId)) {
      if (license.clientIds.length >= maxInstances) {
        return res.status(400).json({
          success: false,
          message: `Maximum instances (${maxInstances}) reached`
        });
      }
      license.clientIds.push(clientId);
      needsUpdate = true;
    }

    // Update login count
    license.loginCount += 1;
    license.lastChecked = currentDate.toISOString();
    needsUpdate = true;

    // Save changes
    if (needsUpdate) {
      await updateLicenseFile(licenses, data.sha, pat);
    }

    return res.status(200).json({
      success: true,
      expired: false,
      message: 'License valid',
      daysLeft: license.daysLeft,
      loginCount: license.loginCount
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateLicenseFile(licenses, sha, pat) {
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
    throw new Error('Failed to update license file');
  }
}
