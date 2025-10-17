export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=14GZSuHPDIberpICidenSMFDnVN5hoZwa&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
