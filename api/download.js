export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=143ngUbbjwl79O61BvytOg3UUHM9HYOJ5&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

