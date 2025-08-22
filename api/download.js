export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1Ozz1aqEx27Q8MV9W91lWYD1ni2xePxi6&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
