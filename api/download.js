export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1Ji8M3iNENX_JKBpNy42IpXQfUHnPTVnm&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
