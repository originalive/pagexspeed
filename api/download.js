export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1_RpVgY0Twl7GQldB4eMAhjbSgqDqQket&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

