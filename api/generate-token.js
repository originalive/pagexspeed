export default async function generateToken(req, res) {
  // Restrict to POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate request body
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  // Check for UserName and MacAddress payload
  const { UserName, MacAddress } = req.body;
  if (UserName && MacAddress && typeof UserName === 'string' && typeof MacAddress === 'string') {
    return res.status(200).json({ success: true, tokens: generateRandomToken() });
  }

  return res.status(400).json({ error: 'UserName and MacAddress must be valid non-empty strings' });

  function generateRandomToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 16; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }
}
