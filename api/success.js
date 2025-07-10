import { Buffer } from 'buffer'; // Node.js Buffer for base64 encoding/decoding

export default async function bookingSuccess(req, res) {
  // Method POST hona chahiye, bilkul validate.js ki tarah
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Client-side se aane wala booking data
  const bookingData = req.body;

  // Basic validation: Check if data is present
  if (!bookingData || Object.keys(bookingData).length === 0) {
    return res.status(400).json({ error: 'No booking data received.' });
  }

  try {
    // Client-side se aane wala 'Access-Token' header extract karo
    const clientAccessToken = req.headers['access-token']; // Headers are usually lowercase in Node.js req object

    // HARDCODED ACCESS TOKEN VALUE (client-side se aane wali value)
    const expectedClientAccessToken = "6b87036af1b3eb1eae8fef8211a7df7749875940d2868b8d7c169844f5cf124a"; 
    
    // CHECK: Agar client ka 'Access-Token' hardcoded value se match nahi karta toh reject karo
    if (!clientAccessToken || clientAccessToken !== expectedClientAccessToken) {
      console.warn('Unauthorized attempt: Client Access-Token mismatch.'); // Warning, not verbose log
      return res.status(401).json({ error: 'Unauthorized: Invalid client access token.' });
    }

    // Ab, GitHub API authentication ke liye GITHUB_BLUEBERRY PAT use karo
    const pat = process.env.GITHUB_BLUEBERRY; // validate.js jaisa 'pat' variable
    if (!pat) {
      console.error('Server configuration error: GITHUB_BLUEBERRY environment variable is not set.');
      return res.status(500).json({ error: 'Server configuration error' }); // validate.js jaisa error message
    }

    // **DIRECTLY USE THE HARDCODED URL FOR SUCCESS.JSON, JAISA AAPNE KAHA THA**
    // Koi extra variables nahi jaise repoOwner, repoName, filePath, branch
    const githubApiUrl = 'https://api.github.com/repos/originalive/verify/contents/success.json';
    
    let currentRecords = []; // success.json ka data yahan load hoga
    let fileSha = null;     // File ka SHA, update ke liye zaroori

    // --- Step 1: GitHub se existing success.json file fetch karna ---
    const response = await fetch(githubApiUrl, { // Direct URL use kiya, validate.js jaisa 'response' variable
      headers: {
        'Authorization': `token ${pat}`, // Yahan GITHUB_BLUEBERRY PAT use hoga
        'Accept': 'application/json',     // Bilkul validate.js jaisa Accept header
      },
    });

    if (response.status === 404) {
      // Agar file nahi mili, toh naya empty array banao, file create hogi
      currentRecords = [];
      fileSha = null; // SHA null rakhenge kyunki file new hai
    } else if (!response.ok) {
      // Handle other HTTP errors during fetch
      const errorDetails = await response.text();
      console.error(`Failed to fetch existing success.json: HTTP ${response.status} - ${errorDetails}`); // Error log
      throw new Error(`Failed to retrieve existing data from GitHub. Status: ${response.status}`);
    } else {
      // File mil gayi, uska content parse karo
      const data = await response.json(); // validate.js jaisa 'data' variable
      fileSha = data.sha; // Update operation ke liye SHA store karo
      currentRecords = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));
    }

    // --- Step 2: Naya booking data append karna ---
    const timestamp = new Date().toISOString();
    const newRecordWithTimestamp = { ...bookingData, savedAt: timestamp };
    currentRecords.push(newRecordWithTimestamp); // Simply append the new record

    // --- Step 3: Updated data ko encode karna aur commit ke liye taiyaar karna ---
    const updatedContent = Buffer.from(JSON.stringify(currentRecords, null, 2)).toString('base64');

    const commitBody = {
      message: `Update success.json with new booking record`, // Commit message
      content: updatedContent,
      // 'branch' property yahan nahi dalenge, bilkul validate.js ki tarah
    };
    if (fileSha) {
      commitBody.sha = fileSha; // Agar existing file update ho rahi hai toh SHA include karo
    }

    // --- Step 4: GitHub par changes commit karna (PUT request) ---
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
      console.error(`Failed to update success.json on GitHub: HTTP ${updateResponse.status} - ${errorDetails}`); // Error log
      throw new Error(`Failed to save booking data to GitHub. Status: ${updateResponse.status} - ${errorDetails}`);
    }

    // Koi verbose success log nahi, validate.js jaisa simple return
    return res.status(200).json({ success: true, message: 'Booking data saved successfully.' });

  } catch (error) {
    console.error('Server error:', error); // validate.js jaisa error log
    return res.status(500).json({ error: 'Internal server error', details: error.message }); // validate.js jaisa error return
  }
}
