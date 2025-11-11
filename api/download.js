export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1chm9jzwvxZ-y4M7mvSwoqKiyTJ45GMIr&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

