export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1OtUCjUDy34n8-HHSDTBuRt7vrTXVmF-y&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

