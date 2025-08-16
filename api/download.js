// /api/extension-url.js

// This function handles incoming requests.
export default function handler(request, response) {
  
  // Define the direct download URL for your extension's zip file.
  // IMPORTANT: You must replace this URL with the actual link to your zip file.
  // For example, you could host the file on GitHub, Dropbox, or any file hosting service.
  const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1IXKa3SKrv0y7L7cZm-2Y_VM_pdnFqQ_P&export=download";

  // Send a JSON response containing the URL.
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
