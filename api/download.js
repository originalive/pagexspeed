export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=13cUZcW_Kx30ALFI0x0fr67S1a4e4zlSd&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
