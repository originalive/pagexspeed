export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=19OqAPREcXQuRBud1vT5f-wtFft3GhujF&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

