// pages/api/reset-mac.js
import { Buffer } from 'buffer';

export default async function resetMac(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Access-Token');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract 'key' from request body
  const { key } = req.body;
  
  if (!key) {
    return res.status(400).json({ 
      status: false, 
      message: 'License key is required.' 
    });
  }

  try {
    // Verify client access token
    const clientAccessToken = req.headers['access-token'];
    const expectedClientAccessToken = "6b87036af1b3eb1eae8fef8211a7df7749875940d2868b8d7c169844f5cf124a";
    
    if (!clientAccessToken || clientAccessToken !== expectedClientAccessToken) {
      return res.status(401).json({ 
        status: false, 
        message: 'Unauthorized.' 
      });
    }

    // Check for GitHub PAT
    const pat = process.env.GITHUB_BLUEBERRY;
    if (!pat) {
      console.error('GitHub PAT not found in environment variables');
      return res.status(500).json({ 
        status: false, 
        message: 'Server configuration error.' 
      });
    }

    // Fetch license data from GitHub
    const githubApiUrl = 'https://api.github.com/repos/originalive/verify/contents/licence3.json';
    
    const response = await fetch(githubApiUrl, {
      headers: { 
        'Authorization': `token ${pat}`, 
        'Accept': 'application/json',
        'User-Agent': 'License-Reset-API'
      },
    });

    if (!response.ok) {
      console.error('GitHub API error:', response.status, response.statusText);
      return res.status(500).json({ 
        status: false, 
        message: 'Failed to retrieve license data.' 
      });
    }

    const data = await response.json();
    const fileSha = data.sha;
    
    // Parse licenses from base64 content
    let licenses;
    try {
      const decodedContent = Buffer.from(data.content, 'base64').toString('utf8');
      licenses = JSON.parse(decodedContent);
    } catch (parseError) {
      console.error('Error parsing license data:', parseError);
      return res.status(500).json({ 
        status: false, 
        message: 'Invalid license data format.' 
      });
    }

    // Find the license to reset by matching the key
    const licenseToReset = licenses.find(l => l.licenseKey === key);
    
    if (!licenseToReset) {
      return res.status(400).json({ 
        status: false, 
        message: 'License key not found.' 
      });
    }

    // Reset the MAC address
    licenseToReset.mac = null;

    // Prepare updated content for GitHub
    const updatedContent = Buffer.from(JSON.stringify(licenses, null, 2)).toString('base64');
    
    const commitBody = {
      message: `Reset MAC for license: ${key}`,
      content: updatedContent,
      sha: fileSha,
    };

    // Update the file on GitHub
    const updateResponse = await fetch(githubApiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${pat}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'License-Reset-API'
      },
      body: JSON.stringify(commitBody),
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      console.error('GitHub update error:', errorData);
      throw new Error('Failed to update license file on GitHub.');
    }

    return res.status(200).json({ 
      status: true, 
      message: 'License MAC has been successfully reset.' 
    });

  } catch (error) {
    console.error('Server error in reset-mac:', error);
    return res.status(500).json({ 
      status: false, 
      message: 'Internal server error.' 
    });
  }
}
