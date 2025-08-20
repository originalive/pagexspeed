export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1ok1vNxqhNAiGVeUDeiVDG_66jcsFc-65&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
