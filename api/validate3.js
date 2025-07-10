// pages/api/validate3.js
import { Buffer } from 'buffer';

// Universal app version, hardcoded here
const GLOBAL_APP_VERSION = "1.5.0"; // <-- Hardcoded universal app version

export default async function validate3(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Client से licenseKey और mac payload में आ रहे हैं
  const { key: licenseKey, mac } = req.body; 
  if (!licenseKey || !mac) {
    return res.status(400).json({ status: false, message: 'License Key and MAC are required.' });
  }

  try {
    // Client के Access-Token को hardcoded value से चेक करना
    const clientAccessToken = req.headers['access-token'];
    const expectedClientAccessToken = "6b87036af1b3eb1eae8fef8211a7df7749875940d2868b8d7c169844f5cf124a";
    if (!clientAccessToken || clientAccessToken !== expectedClientAccessToken) {
      return res.status(401).json({ status: false, message: 'Unauthorized.' });
    }

    // GitHub API के लिए GITHUB_BLUEBERRY PAT use करना
    const pat = process.env.GITHUB_BLUEBERRY;
    if (!pat) {
      return res.status(500).json({ status: false, message: 'Server configuration error.' });
    }

    const githubApiUrl = 'https://api.github.com/repos/originalive/verify/contents/licence3.json';
    const response = await fetch(githubApiUrl, {
      headers: { 'Authorization': `token ${pat}`, 'Accept': 'application/json' },
    });

    if (!response.ok) {
      return res.status(500).json({ status: false, message: 'Failed to retrieve license data.' });
    }

    const data = await response.json();
    const fileSha = data.sha;
    const licenses = JSON.parse(Buffer.from(data.content, 'base64').toString());
    
    const license = licenses.find(l => l.licenseKey === licenseKey);

    if (!license) {
      return res.status(400).json({ status: false, message: 'Invalid license key.' });
    }

    const currentDate = new Date();
    const currentISOTime = currentDate.toISOString();
    let needsUpdate = false;

    // --- Core Logic for MAC binding and Activation Date ---
    if (!license.activationDate || license.activationDate === null) {
      // First time activation for this key
      license.activationDate = currentISOTime;
      license.mac = mac; 
      license.loginCount = 1;
      license.lastLogin = currentISOTime;
      needsUpdate = true;
    } else if (license.mac && license.mac !== mac) {
      // Key is already bound to a different MAC
      return res.status(400).json({ status: false, message: 'License already registered with another MAC address. Please reset it.' });
    } else if (!license.mac || license.mac === null) { 
      // License activated but MAC is null (e.g., after a reset)
      license.mac = mac;
      license.loginCount = (license.loginCount || 0) + 1; // Increment login count
      license.lastLogin = currentISOTime; // Update last login time
      needsUpdate = true;
    } else {
      // License is active and MAC matches, just update login info
      license.loginCount = (license.loginCount || 0) + 1; // Increment login count
      license.lastLogin = currentISOTime; // Update last login time
      needsUpdate = true;
    }

    // --- Calculate Days Left ---
    const activationDate = new Date(license.activationDate); 
    const daysPassed = Math.floor((currentDate - activationDate) / (1000 * 60 * 60 * 24));
    const leftDays = Math.max(0, license.validityDays - daysPassed);

    if (leftDays === 0) {
      return res.status(403).json({ status: false, message: 'Key expired. Please renew.' });
    }

    // --- Update licenses.json on GitHub if changes occurred ---
    if (needsUpdate) {
      const updatedContent = Buffer.from(JSON.stringify(licenses, null, 2)).toString('base64');
      const commitBody = {
        message: `Update license: ${licenseKey}`,
        content: updatedContent,
        sha: fileSha,
      };
      await fetch(githubApiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${pat}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commitBody),
      });
    }

    // --- Send EXACT response to client-side chrome.storage.local.set ---
    return res.status(200).json({
      status: true,
      message: 'License is valid.', // Client expects a message
      data: {
        leftDays: leftDays,       
        appVersion: GLOBAL_APP_VERSION, // Hardcoded universal app version
        ipList: license.ipList || '',           
        shortMessage: license.shortMessage || '', 
        news: license.news || '',               
        keyType: license.keyType || "monthly",    
        paidStatus: license.paidStatus === true // Ensure boolean true/false
      }
    });

  } catch (error) {
    console.error('Server error in validate3:', error);
    return res.status(500).json({ status: false, message: 'Internal server error.' });
  }
}
