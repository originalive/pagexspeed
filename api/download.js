function getDirectDownloadUrlFromGoogleDrive(shareLink) {
  if (!shareLink || !shareLink.includes('drive.google.com')) {
    throw new Error('Invalid Google Drive link format in server config.');
  }
  const parts = shareLink.split('/');
  const idIndex = parts.findIndex(part => part === 'd');
  if (idIndex === -1 || idIndex + 1 >= parts.length) {
    throw new Error('Could not find File ID in the Google Drive link.');
  }
  const fileId = parts[idIndex + 1];
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    // *** IMPORTANT: This is the only line you need to change on the server ***
    const googleDriveShareLink = "YOUR_GOOGLE_DRIVE_SHARE_LINK_HERE";

    const directDownloadUrl = getDirectDownloadUrlFromGoogleDrive(googleDriveShareLink);
    res.status(200).json({
      success: true,
      downloadUrl: directDownloadUrl,
    });
  } catch (error) {
    console.error("Server Error in /api/download:", error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error retrieving download link.',
    });
  }
}
