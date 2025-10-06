import { privateDecrypt, constants, randomBytes, createCipheriv } from 'crypto';

// AES helper function to encrypt the server's response
function encryptResponse(key, data) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', Buffer.from(key, 'base64'), iv);
    const encrypted = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return {
        iv: iv.toString('base64'),
        data: Buffer.concat([encrypted, authTag]).toString('base64')
    };
}

export default async function validate(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { data: encryptedData } = req.body;
  if (!encryptedData) {
    return res.status(400).json({ error: 'Encrypted data is required' });
  }

  // We need a temporary AES key to send back errors if decryption fails later
  let tempAesKey = null;

  try {
    const pat = process.env.GITHUB_BLUEBERRY;
    if (!pat) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // 1. Fetch the entire license file object from GitHub
    const githubResponse = await fetch('https://api.github.com/repos/originalive/verify/contents/licenses.json', {
      headers: { 'Authorization': `token ${pat}`, 'Accept': 'application/json' },
    });

    if (!githubResponse.ok) {
      return res.status(500).json({ error: 'Failed to fetch license data' });
    }

    const fileData = await githubResponse.json();
    const licenseObject = JSON.parse(Buffer.from(fileData.content, 'base64').toString());
    
    // 2. Extract the private key and the licenses array
    const privateKeyString = licenseObject.privateKey;
    const licenses = licenseObject.licenses;

    if (!privateKeyString || !Array.isArray(licenses)) {
        return res.status(500).json({ error: 'Malformed license file on server.' });
    }
    
    // 3. Decrypt the incoming payload using the extracted private key
    let decryptedPayload;
    try {
      const privateKey = privateKeyString.replace(/\\n/g, '\n'); // Ensure newlines are correct
      const decryptedBuffer = privateDecrypt(
        {
          key: privateKey,
          padding: constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256'
        },
        Buffer.from(encryptedData, 'base64')
      );
      decryptedPayload = JSON.parse(decryptedBuffer.toString('utf-8'));
    } catch (e) {
      // If decryption fails, we can't get the AES key to send an encrypted error.
      // We must send a plain text error here.
      return res.status(400).json({ success: false, message: 'Invalid payload. Decryption failed.' });
    }
  
    const { key, clientId, aesKey } = decryptedPayload;
    tempAesKey = aesKey; // Store aesKey for error handling in the outer catch block

    if (!key || !clientId || !aesKey) {
        const encryptedError = encryptResponse(aesKey, { success: false, message: 'Required data missing in payload.' });
        return res.status(400).json(encryptedError);
    }

    const license = licenses.find(l => l.key === key);
    if (!license) {
      const encryptedError = encryptResponse(aesKey, { success: false, message: 'Invalid license key' });
      return res.status(400).json(encryptedError);
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
      const encryptedError = encryptResponse(aesKey, { success: false, expired: true, message: 'Key expired. Purchase a new key or extend it.' });
      return res.status(403).json(encryptedError);
    }

    const maxInstances = license.maxInstances || 1;
    if (!license.clientIds.includes(clientId)) {
      if (license.clientIds.length >= maxInstances) {
        const encryptedError = encryptResponse(aesKey, { success: false, message: `Maximum instances (${maxInstances}) reached` });
        return res.status(400).json(encryptedError);
      }
      license.clientIds.push(clientId);
      needsUpdate = true;
    }

    license.loginCount += 1;
    license.lastLogin = indianTime;
    needsUpdate = true;

    if (needsUpdate) {
      const updatedObject = { ...licenseObject, licenses: licenses };
      await updateLicenseFile(updatedObject, fileData.sha, pat);
    }

    const responsePayload = { success: true, message: 'License valid', daysLeft: daysLeft };
    const encryptedResponse = encryptResponse(aesKey, responsePayload);

    return res.status(200).json(encryptedResponse);

  } catch (error) {
    console.error('Server error:', error);
    if (tempAesKey) {
        const encryptedError = encryptResponse(tempAesKey, { success: false, message: 'Internal server error' });
        return res.status(500).json(encryptedError);
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
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
    throw new Error('Failed to update license file');
  }
}
