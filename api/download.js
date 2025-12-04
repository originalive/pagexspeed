export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1kRA4QhyluUZbQNh0IZ2AjCAiZejbPEGJ&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

