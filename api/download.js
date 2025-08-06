// --- START OF FILE api/download.js ---

/**
 * Converts a standard Google Drive sharing link to a direct download link.
 * @param {string} shareLink - The standard sharing link.
 * @returns {string} The direct download URL.
 */
function getDirectDownloadUrlFromGoogleDrive(shareLink) {
  if (!shareLink || !shareLink.includes('drive.google.com')) {
    throw new Error('Invalid Google Drive link format provided in the server configuration.');
  }
  
  // Example link: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // We need to extract the FILE_ID.
  const parts = shareLink.split('/');
  const idIndex = parts.findIndex(part => part === 'd');

  if (idIndex === -1 || idIndex + 1 >= parts.length) {
    throw new Error('Could not find the File ID in the Google Drive link.');
  }

  const fileId = parts[idIndex + 1];
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

export default function handler(req, res) {
  // This endpoint only responds to GET requests.
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    // ===================================================================================
    // IMPORTANT: This is the only line you need to change on the server
    // when you update your extension file.
    // ===================================================================================
    const googleDriveShareLink = "YOUR_GOOGLE_DRIVE_SHARE_LINK_HERE";

    // Convert the link and send it in the response.
    const directDownloadUrl = getDirectDownloadUrlFromGoogleDrive(googleDriveShareLink);

    res.status(200).json({
      success: true,
      downloadUrl: directDownloadUrl,
    });

  } catch (error) {
    // Log the error for debugging on the server.
    console.error("Server Error in /api/download:", error.message);

    // Send a generic error response to the client.
    res.status(500).json({
      success: false,
      message: 'An internal server error occurred while retrieving the download link.',
    });
  }
}
