import { privateDecrypt, constants } from 'crypto';

export default async function validate(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { data: encryptedData } = req.body;
  if (!encryptedData) {
    return res.status(400).json({ error: 'Encrypted data is required' });
  }

  try {
    const pat = process.env.GITHUB_BLUEBERRY;
    if (!pat) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // --- MODIFIED LOGIC STARTS HERE ---

    // 1. Fetch the entire license file object from GitHub
    const githubResponse = await fetch('https://api.github.com/repos/originalive/verify/contents/licenses.json', {
      headers: { 'Authorization': `token ${pat}`, 'Accept': 'application/json' },
    });

    if (!githubResponse.ok) {
      return res.status(500).json({ error: 'Failed to fetch license data' });
    }

    const fileData = await githubResponse.json();
    const licenseObject = JSON.parse(Buffer.from(fileData.content, 'base64').toString());
    
    // 2. Extract the private key and the licenses array from the object
    const privateKey = licenseObject.privateKey.replace(/\\n/g, '\n');
    const licenses = licenseObject.licenses;

    if (!privateKey || !Array.isArray(licenses)) {
        return res.status(500).json({ error: 'Malformed license file on server.' });
    }
    
    // 3. Decrypt the incoming payload using the extracted private key
    let decryptedPayload;
    try {
      const decryptedBuffer = privateDecrypt(
        {
          key: privateKey,
          padding: constants.RSA_PKCS1_OAEP_PADDING,
        },
        Buffer.from(encryptedData, 'base64')
      );
      decryptedPayload = JSON.parse(decryptedBuffer.toString('utf-8'));
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Invalid payload. Decryption failed.' });
    }
  
    const { key, clientId } = decryptedPayload;
    if (!key || !clientId) {
      return res.status(400).json({ error: 'Decrypted key or clientId is missing' });
    }

    // --- ORIGINAL VALIDATION LOGIC CONTINUES FROM HERE ---

    const license = licenses.find(l => l.key === key);
    if (!license) {
      return res.status(400).json({ success: false, message: 'Invalid license key' });
    }

    const currentDate = new Date();
    const indianTime = currentDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    let needsUpdate = false;
    if (!license.activatedDate) {
      license.activatedDate = indianTime;
      license.clientIds = [];
      license.loginCount = 0;
      needsUpdate = true;
    }

    const activatedDate = new Date(license.activatedDate.split(', ')[0].split('/').reverse().join('-'));
    const daysPassed = Math.floor((currentDate - activatedDate) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, license.validityDays - daysPassed);

    if (daysLeft === 0) {
      return res.status(403).json({ success: false, expired: true, message: 'Key expired. Purchase a new key or extend it.' });
    }

    const maxInstances = license.maxInstances || 1;
    if (!license.clientIds.includes(clientId)) {
      if (license.clientIds.length >= maxInstances) {
        return res.status(400).json({ success: false, message: `Maximum instances (${maxInstances}) reached` });
      }
      license.clientIds.push(clientId);
      needsUpdate = true;
    }

    license.loginCount += 1;
    license.lastLogin = indianTime;
    needsUpdate = true;

    if (needsUpdate) {
      // Pass the entire updated object back to the update function
      const updatedObject = { ...licenseObject, licenses: licenses };
      await updateLicenseFile(updatedObject, fileData.sha, pat);
    }

    return res.status(200).json({ success: true, message: 'License valid', daysLeft: daysLeft });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateLicenseFile(licenseObject, sha, pat) {
  const response = await fetch('https://api.github.com/repos/originalive/verify/contents/licenses.json', {
    method: 'PUT',
    headers: { 'Authorization': `token ${pat}`, 'Accept': 'application/json' },
    body: JSON.stringify({
      message: 'Update license data',
      content: Buffer.from(JSON.stringify(licenseObject, null, 2)).toString('base64'),
      sha: sha,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to update license file: ${errorBody}`);
  }
}
