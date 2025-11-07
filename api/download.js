export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1ykVmEEWQc0TQDcBOmsHd9X9k9gOOtxwC&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

