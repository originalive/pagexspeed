export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1PKfaiEdvVP9wUxvPYHrCzhtbxXvROXAZ&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

