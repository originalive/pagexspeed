export default async function solveCaptcha(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
        apikey: "cZ4ZkgPv804qXPuc1EZQ",
        data: imageContent  // Direct base64 string
      })
    });
    
    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to solve captcha' });
    }
    
    const captchaResult = await response.json();
    
    return res.status(200).json({
      result: captchaResult.result
    });
    
  } catch (error) {
    console.error('Captcha solving error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
