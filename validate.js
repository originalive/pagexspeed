// api/validate.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { key, clientId } = req.body;
  if (!key || !clientId) {
    return res.status(400).json({ error: 'Missing key or clientId' });
  }

  try {
    const pat = process.env.GITHUB_PAT; // Set in Vercel dashboard
    const response = await fetch('https://api.github.com/repos/originalive/verify/contents/licenses.json', {
      headers: {
        'Authorization': `token ${pat}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: `GitHub API error: ${errorData.message}` });
    }

    const data = await response.json();
    const licenses = JSON.parse(Buffer.from(data.content, 'base64').toString());
    const license = licenses.find(l => l.key === key);

    if (!license) {
      return res.status(400).json({ success: false, message: 'Invalid license key' });
    }

    if (license.clientId && license.clientId !== clientId) {
      return res.status(400).json({ success: false, message: 'License key is bound to another device' });
    }

    if (!license.clientId) {
      license.clientId = clientId;
      await updateLicenseFile(licenses, data.sha, pat);
    }

    return res.status(200).json({ success: true, message: 'License validated!', expiry: license.expiry });
  } catch (error) {
    return res.status(500).json({ error: 'Server error: ' + error.message });
  }
}

async function updateLicenseFile(licenses, sha, pat) {
  const response = await fetch('https://api.github.com/repos/originalive/verify/contents/licenses.json', {
    method: 'PUT',
    headers: {
      'Authorization': `token ${pat}`,
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      message: 'Bind license key to client',
      content: Buffer.from(JSON.stringify(licenses)).toString('base64'),
      sha: sha
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`GitHub API error: ${response.status} - ${errorData.message}`);
  }
}