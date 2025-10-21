export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1W-wnktQg5HcbIiwa2THkqedKDvPk81Dc&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

