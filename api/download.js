export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1NMUVcbR16MnqULapExq-z07-qAUDsuaY&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
