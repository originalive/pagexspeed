export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1vGPrdH8AP_yxz2_IP1Yyfhlvr6cUSLKP&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

