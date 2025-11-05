export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=13ogC8gdMrpYYCtACgTAA5EBretcLhLVB&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

