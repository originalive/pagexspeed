export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1A6-P1ZuV8pi22yHHD43jefB4PX4-3--K&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
