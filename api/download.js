export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1asHmSFpGxCBy8s92hna6S69rgGCuNqSn&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

