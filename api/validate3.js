// pages/api/validate3.js
import { Buffer } from 'buffer';

// Universal app version, hardcoded here
const GLOBAL_APP_VERSION = "1.5.0";

export default async function validate3(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { key: licenseKey, mac } = req.body;
  
  if (!licenseKey || !mac) {
    return res.status(400).json({ 
      status: false, 
      message: 'License Key and MAC are required.' 
    });
  }

  try {
    // Client access token validation
    const clientAccessToken = req.headers['access-token'];
    const expectedClientAccessToken = "6b87036af1b3eb1eae8fef8211a7df7749875940d2868b8d7c169844f5cf124a";
    if (!clientAccessToken || clientAccessToken !== expectedClientAccessToken) {
      return res.status(401).json({ 
        status: false, 
        message: 'Unauthorized.' 
      });
    }

    const pat = process.env.GITHUB_BLUEBERRY;
    if (!pat) {
      return res.status(500).json({ 
        status: false, 
        message: 'Server configuration error.' 
      });
    }

    // Fetch licenses from GitHub
    const response = await fetch('https://api.github.com/repos/originalive/verify/contents/licence3.json', {
      headers: {
        'Authorization': `token ${pat}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(500).json({ 
        status: false, 
        message: 'Failed to retrieve license data.' 
      });
    }

    const data = await response.json();
    const licenses = JSON.parse(Buffer.from(data.content, 'base64').toString());

    // Find license
    const license = licenses.find(l => l.licenseKey === licenseKey);
    if (!license) {
      return res.status(400).json({ 
        status: false, 
        message: 'Invalid license key.' 
      });
    }

    const currentDate = new Date();
    const currentISOTime = currentDate.toISOString();
    let needsUpdate = false;

    // Core Logic for MAC binding and Activation Date
    if (!license.activationDate || license.activationDate === null) {
      // First time activation for this key
      license.activationDate = currentISOTime;
      license.mac = mac; 
      license.loginCount = 1;
      license.lastLogin = currentISOTime;
      needsUpdate = true;
    } else if (license.mac && license.mac !== mac) {
      // Key is already bound to a different MAC
      return res.status(400).json({ 
        status: false, 
        message: 'License already registered with another MAC address. Please reset it.' 
      });
    } else if (!license.mac || license.mac === null) { 
      // License activated but MAC is null (e.g., after a reset)
      license.mac = mac;
      license.loginCount = (license.loginCount || 0) + 1;
      license.lastLogin = currentISOTime;
      needsUpdate = true;
    } else {
      // License is active and MAC matches, just update login info
      license.loginCount = (license.loginCount || 0) + 1;
      license.lastLogin = currentISOTime;
      needsUpdate = true;
    }

    // Calculate Days Left
    const activationDate = new Date(license.activationDate); 
    const daysPassed = Math.floor((currentDate - activationDate) / (1000 * 60 * 60 * 24));
    const leftDays = Math.max(0, license.validityDays - daysPassed);

    if (leftDays === 0) {
      return res.status(403).json({ 
        status: false, 
        message: 'Key expired. Please renew.' 
      });
    }

    // Save changes if needed
    if (needsUpdate) {
      await updateLicenseFile(licenses, data.sha, pat);
    }

    // Return response in EXACT format expected by obfuscated client
    return res.status(200).json({
      status: true,
      message: 'License is valid.',
      data: {
        leftDays: leftDays,
        appVersion: GLOBAL_APP_VERSION,
        ipList: license.ipList || '',
        shortMessage: license.shortMessage || '',
        news: license.news || '',
        News: license.news || '', // Client code expects 'News' with capital N
        keyType: license.keyType || "monthly",
        paidStatus: license.paidStatus === true,
        payment: license.paidStatus === true // Client code expects 'payment' field
      }
    });

  } catch (error) {
    console.error('Server error in validate3:', error);
    return res.status(500).json({ 
      status: false, 
      message: 'Internal server error.' 
    });
  }
}

async function updateLicenseFile(licenses, sha, pat) {
  const response = await fetch('https://api.github.com/repos/originalive/verify/contents/licence3.json', {
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
