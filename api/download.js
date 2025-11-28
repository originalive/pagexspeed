export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1jv0jAPtEAIXrPuWZpNyXBtF3ZeUI35Rl&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

