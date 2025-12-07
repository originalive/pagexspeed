export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1LbvQ8LNOyuOcBibJmo3M5xcnbMC2o7-p&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

