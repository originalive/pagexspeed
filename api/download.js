export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1YuWSemK52xfb32FC2gLC663Oc-ZiDotW&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

