export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=104wDPd9ymNCGHmOj2nv39yU367lh6Biz&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
