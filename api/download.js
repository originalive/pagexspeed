export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1a07KfSYY8rrlSip8EyAuZL8AIc1YsPOF&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

