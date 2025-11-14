export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1eGBWxO4W1twU459kjHZ1Qgr6YUg_7XXc&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

