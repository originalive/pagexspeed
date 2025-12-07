export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=17U-XGLmvN-s8ylcPGw8MjICDf9tdmg-o&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

