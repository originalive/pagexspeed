export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1OpVFLqRrHnGnsF4LsjjTDbliyfI-bc1e&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
