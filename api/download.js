export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1fuKa2sRoAbbCcOPIxmEdG6t5rKEdMgcp&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

