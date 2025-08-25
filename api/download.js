export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1ydyEMtgWv8F9DaVGhp6MEMNtEcJOKZn6&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
