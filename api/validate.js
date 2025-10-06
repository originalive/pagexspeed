import { privateDecrypt, constants, randomBytes, createCipheriv } from 'crypto';

// Server-side AES encryption helper
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

// Main API function
export default async function validate(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { data: encryptedData } = req.body;
  if (!encryptedData) {
    return res.status(400).json({ error: 'Encrypted data is required' });
  }
  
  let tempAesKey = null;

  try {
    // 1. Fetch license file from GitHub
    const pat = process.env.GITHUB_BLUEBERRY;
    const githubResponse = await fetch('https://api.github.com/repos/originalive/verify/contents/licenses.json', {
      headers: { 'Authorization': `token ${pat}`, 'Accept': 'application/json' },
    });
    if (!githubResponse.ok) throw new Error('Failed to fetch license file.');

    const fileData = await githubResponse.json();
    const licenseObject = JSON.parse(Buffer.from(fileData.content, 'base64').toString());
    const privateKeyString = licenseObject.privateKey;
    const licenses = licenseObject.licenses;

    // 2. Decrypt the incoming payload from the client
    let decryptedPayload;
    try {
        const privateKey = privateKeyString.replace(/\\n/g, '\n');
        decryptedPayload = JSON.parse(privateDecrypt({ key: privateKey, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, Buffer.from(encryptedData, 'base64')).toString('utf-8'));
    } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid payload.' });
    }

    const { key, clientId, aesKey } = decryptedPayload;
    tempAesKey = aesKey;

    if (!clientId || !aesKey) {
        return res.status(400).json(encryptResponse(aesKey, { success: false, message: 'Payload incomplete.' }));
    }

    // --- UNIFIED LOGIC ---
    if (key) {
        // --- CASE 1: KEY IS PROVIDED (NEW ACTIVATION) ---
        const license = licenses.find(l => l.key === key);
        if (!license) return res.status(400).json(encryptResponse(aesKey, { success: false, message: 'Invalid license key' }));

        let needsUpdate = false;
        
        if (!license.activatedDate) {
            license.activatedDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            license.clientIds = [];
            needsUpdate = true;
        }

        const activatedDate = new Date(license.activatedDate.split(', ')[0].split('/').reverse().join('-'));
        const daysPassed = Math.floor((new Date() - activatedDate) / (1000 * 60 * 60 * 24));
        const daysLeft = Math.max(0, license.validityDays - daysPassed);
        
        if (daysLeft === 0) return res.status(403).json(encryptResponse(aesKey, { success: false, expired: true, message: 'Key is expired.' }));
        
        if (!license.clientIds.includes(clientId)) {
            if (license.clientIds.length >= (license.maxInstances || 1)) {
                return res.status(400).json(encryptResponse(aesKey, { success: false, message: 'Maximum instances reached.' }));
            }
            license.clientIds.push(clientId);
            needsUpdate = true;
        }
        
        license.loginCount = (license.loginCount || 0) + 1;
        license.lastLogin = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        needsUpdate = true;
        
        if (needsUpdate) {
            await updateLicenseFile({ ...licenseObject, licenses }, fileData.sha, pat);
        }
        return res.status(200).json(encryptResponse(aesKey, { success: true, daysLeft }));
    } else {
        // --- CASE 2: KEY IS NOT PROVIDED (HEARTBEAT CHECK) ---
        const existingLicense = licenses.find(l => l.clientIds && l.clientIds.includes(clientId));
        if (!existingLicense) {
            return res.status(200).json(encryptResponse(aesKey, { success: false, message: 'Client ID not registered.' }));
        }

        const activatedDate = new Date(existingLicense.activatedDate.split(', ')[0].split('/').reverse().join('-'));
        const daysPassed = Math.floor((new Date() - activatedDate) / (1000 * 60 * 60 * 24));
        const daysLeft = Math.max(0, existingLicense.validityDays - daysPassed);

        if (daysLeft === 0) {
            return res.status(200).json(encryptResponse(aesKey, { success: false, message: 'License expired.' }));
        }
        return res.status(200).json(encryptResponse(aesKey, { success: true, daysLeft }));
    }
  } catch (error) {
    console.error('Validation Error:', error);
    if (tempAesKey) {
        return res.status(500).json(encryptResponse(tempAesKey, { success: false, message: 'Internal server error.' }));
    }
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

// GitHub file update helper
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
  if (!response.ok) throw new Error('Failed to update license file');
}
