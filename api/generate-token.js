export default async function generateToken(req, res) {
  // Restrict to POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate request body
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  // Check for licenseKey and deviceId payload
  const { licenseKey, deviceId } = req.body;
  if (licenseKey && deviceId && typeof licenseKey === 'string' && typeof deviceId === 'string') {
    return res.status(200).json({ success: true, tokens: generateRandomToken() });
  }

  return res.status(400).json({ error: 'licenseKey and deviceId must be valid non-empty strings' });

  function generateRandomToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 16; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }
}
