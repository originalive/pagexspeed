export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { key, clientId } = req.body;
  if (!key || !clientId) {
    return res.status(400).json({ error: 'Missing key or clientId' });
  }

  try {
    const pat = process.env.GITHUB_BLUEBERRY;

    // Fetch licenses.json from GitHub
    const response = await fetch('https://api.github.com/repos/originalive/verify/contents/licenses.json', {
      headers: {
        'Authorization': `token ${pat}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: `GitHub API error: ${errorData.message}` });
    }

    const data = await response.json();
    const licenses = JSON.parse(Buffer.from(data.content, 'base64').toString());
    const license = licenses.find(l => l.key === key);

    if (!license) {
      return res.status(400).json({ success: false, message: 'Invalid license key' });
    }

    // Check if license is expired
    if (license.isExpired) {
      return res.status(400).json({ success: false, message: 'License key has expired' });
    }

    // Validate clientId binding
    const maxInstances = license.maxInstances || 1;
    if (!license.clientIds.includes(clientId)) {
      if (license.clientIds.length >= maxInstances) {
        return res.status(400).json({ success: false, message: `License key is bound to maximum allowed instances (${maxInstances})` });
      }
      license.clientIds.push(clientId);
      needsUpdate = true;
    }

    // Initialize firstUsed if null
    let needsUpdate = false;
    if (!license.firstUsed) {
      license.firstUsed = new Date().toISOString();
      needsUpdate = true;
    }

    // Calculate days left based on firstUsed
    const firstUsedDate = new Date(license.firstUsed);
    const currentDate = new Date();
    const daysSinceFirstUse = Math.floor((currentDate - firstUsedDate) / (1000 * 60 * 60 * 24));
    const initialDays = 30; // Configurable initial days
    license.daysLeft = Math.max(0, initialDays - daysSinceFirstUse);
    if (license.daysLeft === 0) {
      license.isExpired = true;
      needsUpdate = true;
    }

    // Increment login count
    license.loginCount = (license.loginCount || 0) + 1;
    needsUpdate = true;

    // Update licenses.json if changes were made
    if (needsUpdate) {
      await updateLicenseFile(licenses, data.sha, pat);
    }

    return res.status(200).json({
      success: true,
      message: 'License validated!',
      daysLeft: license.daysLeft,
      loginCount: license.loginCount,
      isExpired: license.isExpired,
      maxInstances: maxInstances,
      boundInstances: license.clientIds.length
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error: ' + error.message });
  }
}

async function updateLicenseFile(licenses, sha, pat) {
  const response = await fetch('https://api.github.com/repos/originalive/verify/contents/licenses.json', {
    method: 'PUT',
    headers: {
      'Authorization': `token ${pat}`,
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      message: 'Update license data',
      content: Buffer.from(JSON.stringify(licenses, null, 2)).toString('base64'),
      sha: sha
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`GitHub API error: ${response.status} - ${errorData.message}`);
  }
}
