export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1N8TFuNDQE6JHPI0rFIw439XgNAQMBHev&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
