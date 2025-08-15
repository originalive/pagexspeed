export default async function solveCaptcha(req, res) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'content-type,x-auth-token');
  
  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  // Handle POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Extract x-auth-token from headers
  const authToken = req.headers['x-auth-token'];
  
  // Simple validation - just check if token exists
  if (!authToken) {
    return res.status(401).json({ error: 'x-auth-token is required' });
  }
  
  const { imageContent } = req.body;
  
  if (!imageContent) {
    return res.status(400).json({ error: 'imageContent is required' });
  }
  
  try {
    // Send to TrueCaptcha API - direct base64 string bhejo
    const response = await fetch('https://api.apitruecaptcha.org/one/gettext', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userid: "amankrmishra",
        apikey: "XIkzbwSijmqpJP2EU1FH",
        data: imageContent  // Direct base64 string
      })
    });
    
    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to solve captcha' });
    }
    
    const captchaResult = await response.json();
    
    // Pass the complete response from TrueCaptcha API to client
    return res.status(200).json(captchaResult);
    
  } catch (error) {
    console.error('Captcha solving error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
