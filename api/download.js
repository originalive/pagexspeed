export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1nl82-oYdp3CASS0Qr5AZpj-lPs4bGmaO&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
