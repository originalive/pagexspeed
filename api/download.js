export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/u/0/uc?id=1K6jPNtz6TF0CpJEG_Q7O3f9C3a3rkCXM&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

