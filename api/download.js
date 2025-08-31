export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=19zL9Z0beqarGtP8Ei8d5mdXMSzIDEaML&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
