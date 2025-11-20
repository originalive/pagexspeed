export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1OsRpnQuw9sJkqc0Wj7ZdoEbPeydG_UdY&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

