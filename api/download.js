export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1PEAeb18CKuHHVVr_q_gCHdpcBiHscA6d&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
