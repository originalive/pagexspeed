export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=19EyCsvmmSLP8RKinwXOIv-wJwd2AwAx1&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

