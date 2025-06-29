export default async function validate(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { key, clientId } = req.body;
  
  if (!key || !clientId) {
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
    const license = licenses.find(l => l.key === key);
    if (!license) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid license key' 
      });
    }

    const currentDate = new Date();
    const indianTime = currentDate.toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let needsUpdate = false;

    // Initialize license on first use
    if (!license.activatedDate) {
      license.activatedDate = indianTime;
      license.clientIds = [];
      license.loginCount = 0;
      needsUpdate = true;
    }

    // Calculate days left
    const activatedDate = new Date(license.activatedDate.split(', ')[0].split('/').reverse().join('-'));
    const daysPassed = Math.floor((currentDate - activatedDate) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, license.validityDays - daysPassed);

    // Check if expired
    if (daysLeft === 0) {
      return res.status(403).json({ 
        success: false, 
        expired: true,
        message: 'Key expired. Purchase a new key or extend it.'
      });
    }

    // Check client instances
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

    // Update login info
    license.loginCount += 1;
    license.lastLogin = indianTime;
    needsUpdate = true;

    // Save changes
    if (needsUpdate) {
      await updateLicenseFile(licenses, data.sha, pat);
    }

    return res.status(200).json({
      success: true,
      expired: false,
      message: 'License valid',
      daysLeft: daysLeft
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
