export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1Xl0i-H3halCaCptdZ4--Y0qXOzYnCMOy&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

