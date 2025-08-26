export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1BByulprWRBKm8mxwqiOEhRb0DkfHrTWt&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
