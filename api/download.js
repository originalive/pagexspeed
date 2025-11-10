export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=19hWK7mPjt6cBwHpw_1nnKYQW3wqYKcPM&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

