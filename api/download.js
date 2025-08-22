export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1EsLdUPEygs8lIqzuYUV-mxVIDw3m_E1S&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
