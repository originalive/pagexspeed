export default async function handler(req, res) {
  // Use 'handler' to match Vercel's convention, but the internal logic is the same.
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // We are not expecting key or clientId, but the booking data payload.
  const newBookingData = req.body;
  
  if (!newBookingData || !newBookingData.pnr) {
    return res.status(400).json({ error: 'Booking data with PNR is required' });
  }

  try {
    // --- USING THE EXACT SAME PAT VARIABLE NAME ---
    const pat = process.env.GITHUB_BLUEBERRY;
    if (!pat) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // --- Fetch bookings instead of licenses ---
    const response = await fetch('https://api.github.com/repos/originalive/verify/contents/booked.json', {
      headers: {
        'Authorization': `token ${pat}`,
        'Accept': 'application/json',
      },
    });

    let bookings = [];
    let fileSha = null;

    if (response.status === 404) {
      // File doesn't exist. We'll create it.
      console.log('booked.json not found. Creating a new one.');
    } else if (response.ok) {
      // File exists.
      const data = await response.json();
      fileSha = data.sha; // Get the SHA from the file data
      bookings = JSON.parse(Buffer.from(data.content, 'base64').toString());
    } else {
      // Handle other GitHub API errors.
      return res.status(500).json({ error: 'Failed to fetch booking data' });
    }
    
    // --- LOGIC REPLACEMENT: No validation, just append data ---
    const indianTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    bookings.push({
        loggedAt: indianTime,
        ...newBookingData
    });
    // --- END OF LOGIC REPLACEMENT ---


    // --- Save changes using the same pattern ---
    // The 'sha' is passed from the file data we fetched.
    await updateBookedFile(bookings, fileSha, pat); 

    return res.status(200).json({
      success: true,
      message: 'Booking logged successfully'
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// --- HELPER FUNCTION: Renamed and adjusted for booked.json ---
async function updateBookedFile(bookings, sha, pat) {
  const response = await fetch('https://api.github.com/repos/originalive/verify/contents/booked.json', {
    method: 'PUT',
    headers: {
      'Authorization': `token ${pat}`,
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      message: `[API] Log new booking - ${new Date().toISOString()}`,
      content: Buffer.from(JSON.stringify(bookings, null, 2)).toString('base64'),
      sha: sha, // Pass the sha here. If it's null, GitHub creates the file.
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update booked.json file');
  }
}
