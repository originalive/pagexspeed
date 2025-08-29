export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const newBookingData = req.body;
  
  if (!newBookingData || !newBookingData.pnr) {
    return res.status(400).json({ error: 'Booking data with PNR is required' });
  }

  try {
    const pat = process.env.GITHUB_BLUEBERRY;
    if (!pat) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const response = await fetch('https://api.github.com/repos/originalive/verify/contents/booked.json', {
      headers: {
        'Authorization': `token ${pat}`,
        'Accept': 'application/json',
      },
    });

    let bookings = [];
    let fileSha = null;

    if (response.status === 404) {
      console.log('booked.json not found. Creating a new one.');
    } else if (response.ok) {
      const data = await response.json();
      fileSha = data.sha;
      const content = Buffer.from(data.content, 'base64').toString();
      
      if (content) {
        try {
          bookings = JSON.parse(content);
        } catch (e) {
          console.error("booked.json contains invalid JSON. Starting with a fresh array.");
          bookings = [];
        }
      } else {
        bookings = [];
      }
    } else {
      return res.status(500).json({ error: 'Failed to fetch booking data' });
    }
    
    const indianTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    bookings.push({
        loggedAt: indianTime,
        ...newBookingData
    });

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
      sha: sha,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update booked.json file');
  }
}
