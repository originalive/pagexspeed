export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1KQ0lMXGiGRJKnNdQUi65_iDaZ33iyLYi&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

