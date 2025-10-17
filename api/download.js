export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1-ncJuOOk2A_eoB11oDOVIN3yGdhkcbQ6&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
