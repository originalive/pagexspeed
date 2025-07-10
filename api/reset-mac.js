// pages/api/reset-mac.js
import { Buffer } from 'buffer';

export default async function resetMac(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Client से आने वाला payload: सिर्फ 'key'
  const { key } = req.body; // <-- CORRECT: 'key' is extracted directly
  if (!key) {
    return res.status(400).json({ status: false, message: 'License key is required.' });
  }

  try {
    const clientAccessToken = req.headers['access-token'];
    const expectedClientAccessToken = "6b87036af1b3eb1eae8fef8211a7df7749875940d2868b8d7c169844f5cf124a";
    if (!clientAccessToken || clientAccessToken !== expectedClientAccessToken) {
      return res.status(401).json({ status: false, message: 'Unauthorized.' });
    }

    const pat = process.env.GITHUB_BLUEBERRY;
    if (!pat) {
      return res.status(500).json({ status: false, message: 'Server configuration error.' });
    }

    const githubApiUrl = 'https://api.github.com/repos/originalive/verify/contents/licence3.json';
    const response = await fetch(githubApiUrl, {
      headers: { 'Authorization': `token ${pat}`, 'Accept': 'application/json' },
    });

    if (!response.ok) {
      return res.status(500).json({ status: false, message: 'Failed to retrieve license data.' });
    }

    const data = await response.json();
    const fileSha = data.sha;
    const licenses = JSON.parse(Buffer.from(data.content, 'base64').toString());
    
    // **KEY MATCHING LOGIC:** client से आई 'key' को licenses.json की 'licenseKey' से match करो
    const licenseToReset = licenses.find(l => l.licenseKey === key);

    if (!licenseToReset) {
      return res.status(400).json({ status: false, message: 'License key not found.' });
    }

    licenseToReset.mac = null; 

    const updatedContent = Buffer.from(JSON.stringify(licenses, null, 2)).toString('base64');
    const commitBody = {
      message: `Reset MAC for license: ${key}`, // Commit message में client से आई 'key'
      content: updatedContent,
      sha: fileSha,
    };

    const updateResponse = await fetch(githubApiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${pat}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commitBody),
    });

    if (!updateResponse.ok) {
        throw new Error('Failed to update license file on GitHub.');
    }
    
    return res.status(200).json({ status: true, message: 'License MAC has been successfully reset.' });

  } catch (error) {
    console.error('Server error in reset-mac:', error);
    return res.status(500).json({ status: false, message: 'Internal server error.' });
  }
}
