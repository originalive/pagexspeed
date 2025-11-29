export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1yHQoyqLaK_kQZuUPe35DqnLZLg70GzQ_&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

