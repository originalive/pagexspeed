export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1M4f6k31sohnj9soAj99ULMS3iEIcnPNT&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

