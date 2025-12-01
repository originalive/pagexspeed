export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1P9KdCq62yh8xESom5P9Cj0zlCCDiEqM1&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

