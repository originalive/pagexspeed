export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1_48Wd7pnTSaWYcKpVoCyGqI7DVKeCdf4&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

