export default async function validate(req, res) {
  if (req.method !== 'POST') 
    return res.status(405).json({ error: 'Method not allowed' });

  const { key } = req.body;
  if (!key) 
    return res.status(400).json({ success: false, message: 'License key required.' });

  try {
    const pat = process.env.GITHUB_BLUEBERRY;
    const response = await fetch('https://api.github.com/repos/originalive/verify/contents/licenses.json', {
      headers: { Authorization: `token ${pat}`, Accept: 'application/vnd.github.v3+json' },
    });

    if (!response.ok) throw new Error('Failed to fetch license file.');

    const data = await response.json();
    const content = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
    const { licenses = [] } = content;

    const found = licenses.find(l => l.key === key);

    return res.status(found ? 200 : 404).json({
      success: !!found,
      message: found ? 'Valid license.' : 'Invalid license.'
    });

  } catch (err) {
    console.error('Validation Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}
