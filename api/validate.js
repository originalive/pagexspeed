const generateJWT = (payload, secret) => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = Buffer.from(`${header}.${payloadStr}.${secret}`).toString('base64');
  return `${header}.${payloadStr}.${signature}`;
};

const verifyJWT = (token, secret) => {
  try {
    const [header, payload, signature] = token.split('.');
    const expectedSignature = Buffer.from(`${header}.${payload}.${secret}`).toString('base64');
    if (signature !== expectedSignature) return null;
    return JSON.parse(Buffer.from(payload, 'base64').toString());
  } catch {
    return null;
  }
};

// Simple challenge generation and verification (for simulation)
const generateChallenge = (key, clientId) => {
  const secret = process.env.CHALLENGE_SECRET || 'your-challenge-secret';
  const nonce = Math.random().toString(36).substring(2, 15);
  const payload = JSON.stringify({ key, clientId, nonce, timestamp: Date.now() });
  return Buffer.from(`${payload}.${secret}`).toString('base64');
};

const verifyChallenge = (challenge, key, clientId) => {
  try {
    const secret = process.env.CHALLENGE_SECRET || 'your-challenge-secret';
    const decoded = Buffer.from(challenge, 'base64').toString().split('.')[0];
    const payload = JSON.parse(decoded);
    if (payload.key !== key || payload.clientId !== clientId) return false;
    // Ensure challenge is recent (e.g., within 5 minutes)
    return (Date.now() - payload.timestamp) < 5 * 60 * 1000;
  } catch {
    return false;
  }
};

export default async function validate(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { key, clientId, token, challenge } = req.body;
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secure-jwt-secret';

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
    let jwtToken = token;

    // Verify challenge for subsequent requests
    if (license.loginCount > 0) {
      if (!challenge || !verifyChallenge(challenge, key, clientId)) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or missing challenge'
        });
      }
    }

    // Handle token validation
    if (license.loginCount > 0) {
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Token required after first login'
        });
      }
      const payload = verifyJWT(token, JWT_SECRET);
      if (!payload || payload.clientId !== clientId || payload.key !== key || token !== license.token) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }
    }

    // First login: generate and store token and challenge
    if (!token) {
      const tokenPayload = {
        clientId,
        key,
        exp: Math.floor(currentDate.getTime() / 1000) + (license.validityDays * 24 * 60 * 60)
      };
      jwtToken = generateJWT(tokenPayload, JWT_SECRET);
      license.token = jwtToken;
      needsUpdate = true;
    }

    // Calculate days left
    const activatedDate = new Date(license.activatedDate?.split(', ')[0].split('/').reverse().join('-') || currentDate);
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
    if (!license.activatedDate) {
      license.activatedDate = indianTime;
      needsUpdate = true;
    }

    // Generate new challenge for the next request
    const newChallenge = generateChallenge(key, clientId);

    // Save changes
    if (needsUpdate) {
      await updateLicenseFile(licenses, data.sha, pat);
    }

    return res.status(200).json({
      success: true,
      expired: false,
      message: 'License valid',
      daysLeft: daysLeft,
      token: jwtToken,
      challenge: newChallenge
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
