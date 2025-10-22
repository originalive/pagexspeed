export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1RXhLlGaCcez5iY6AlH243fVcsHACnLh5&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

