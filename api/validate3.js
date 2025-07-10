// pages/api/validate2.js
import { Buffer } from 'buffer'; // Node.js Buffer for base64 encoding/decoding

export default async function validate2(req, res) {
  // Method POST hona chahiye, bilkul validate.js ki tarah
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Client-side se aane wala payload extract karo: key aur mac
  const { key, mac } = req.body; // 'mac' is equivalent to 'clientId' in your validate.js

  // Basic validation: Check if key and mac are present
  if (!key || !mac) {
    return res.status(400).json({ status: false, message: 'License key and MAC address are required.' });
  }

  try {
    // Client-side se aane wala 'Access-Token' header extract karo
    const clientAccessToken = req.headers['access-token']; // Headers are usually lowercase in Node.js req object

    // HARDCODED ACCESS TOKEN VALUE (client-side se aane wali value)
    const expectedClientAccessToken = "6b87036af1b3eb1eae8fef8211a7df7749875940d2868b8d7c169844f5cf124a"; 
    
    // CHECK: Agar client ka 'Access-Token' hardcoded value se match nahi karta toh reject karo
    if (!clientAccessToken || clientAccessToken !== expectedClientAccessToken) {
      console.warn('Unauthorized attempt: Client Access-Token mismatch for validate2.');
      return res.status(401).json({ status: false, message: 'Unauthorized: Invalid client access token.' });
    }

    // Ab, GitHub API authentication ke liye GITHUB_BLUEBERRY PAT use karo
    const pat = process.env.GITHUB_BLUEBERRY; // validate.js jaisa 'pat' variable
    if (!pat) {
      console.error('Server configuration error: GITHUB_BLUEBERRY environment variable is not set.');
      return res.status(500).json({ status: false, message: 'Server configuration error: GitHub PAT not set.' });
    }

    // **DIRECTLY USE THE HARDCODED URL FOR LICENSES.JSON, JAISA VALIDATE.JS MEIN HAI**
    const githubApiUrl = 'https://api.github.com/repos/originalive/verify/contents/licenses.json';
    
    let licenses = []; // licenses.json ka data yahan load hoga
    let fileSha = null;     // File ka SHA, update ke liye zaroori

    // --- Step 1: GitHub se existing licenses.json file fetch karna ---
    const response = await fetch(githubApiUrl, { // Direct URL use kiya, validate.js jaisa 'response' variable
      headers: {
        'Authorization': `token ${pat}`, // Yahan GITHUB_BLUEBERRY PAT use hoga
        'Accept': 'application/json',     // Bilkul validate.js jaisa Accept header
      },
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error(`Failed to fetch licenses.json: HTTP ${response.status} - ${errorDetails}`);
      return res.status(500).json({ status: false, message: `Failed to retrieve license data: ${response.statusText}` });
    }

    const data = await response.json(); // validate.js jaisa 'data' variable
    fileSha = data.sha; // Update operation ke liye SHA store karo
    licenses = JSON.parse(Buffer.from(data.content, 'base64').toString());

    // --- Step 2: License ko find karo aur logic apply karo (validate.js jaisa) ---
    const license = licenses.find(l => l.key === key);
    if (!license) {
      return res.status(400).json({ status: false, message: 'Invalid license key.' });
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

    // Initialize license on first use (validate.js jaisa)
    if (!license.activatedDate) {
      license.activatedDate = indianTime;
      license.clientIds = [];
      license.loginCount = 0;
      needsUpdate = true;
    }

    // Calculate days left (validate.js jaisa)
    // Ensure activatedDate is parsed correctly for calculation
    const [day, month, year] = license.activatedDate.split(', ')[0].split('/');
    const activatedDate = new Date(`${year}-${month}-${day}`);
    const daysPassed = Math.floor((currentDate - activatedDate) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, license.validityDays - daysPassed);

    // Check if expired (validate.js jaisa)
    if (daysLeft === 0) {
      return res.status(403).json({ status: false, message: 'Key expired. Purchase a new key or extend it.' });
    }

    // Check client instances (validate.js jaisa)
    const maxInstances = license.maxInstances || 1;
    if (!license.clientIds.includes(mac)) { // 'mac' is 'clientId' here
      if (license.clientIds.length >= maxInstances) {
        return res.status(400).json({ status: false, message: `Maximum instances (${maxInstances}) reached.` });
      }
      license.clientIds.push(mac); // Add 'mac'
      needsUpdate = true;
    }

    // Update login info (validate.js jaisa)
    license.loginCount = (license.loginCount || 0) + 1; // Ensure loginCount is initialized
    license.lastLogin = indianTime;
    needsUpdate = true;

    // --- Step 3: Save changes if needed (validate.js jaisa) ---
    if (needsUpdate) {
      const updatedContent = Buffer.from(JSON.stringify(licenses, null, 2)).toString('base64');

      const commitBody = {
        message: `Update license data for key: ${key}`, // Commit message
        content: updatedContent,
        sha: fileSha, // Always include SHA for updating an existing file
      };

      const updateResponse = await fetch(githubApiUrl, { // Direct URL use kiya
        method: 'PUT', // Files create/update karne ke liye PUT use hota hai
        headers: {
          'Authorization': `token ${pat}`, // Yahan GITHUB_BLUEBERRY PAT use hoga
          'Accept': 'application/json',     // Bilkul validate.js jaisa Accept header
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commitBody),
      });

      if (!updateResponse.ok) {
        const errorDetails = await updateResponse.text();
        console.error(`Failed to update licenses.json: HTTP ${updateResponse.status} - ${errorDetails}`);
        throw new Error(`Failed to update license data: ${updateResponse.statusText}`);
      }
    }

    // --- Step 4: Return response as expected by client-side LicenseChecklogin ---
    return res.status(200).json({
      status: true,
      message: 'License valid', // Client expects a message
      data: {
        leftDays: daysLeft,
        appVersion: license.appVersion || "1.0", // Assuming these fields exist on license object
        ipList: license.ipList || '',
        shortMessage: license.shortMessage || '',
        News: license.News || '',
        keyType: license.keyType || "monthly",
        payment: license.payment || false // Assuming 'payment' field exists
      }
    });

  } catch (error) {
    console.error('Server error:', error); // validate.js jaisa error log
    return res.status(500).json({ status: false, message: 'Internal server error.' });
  }
}
