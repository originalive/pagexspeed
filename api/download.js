export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=18ZDHhNR4MJ1KGnPgVrLhiGl8rx4G54ZZ&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

