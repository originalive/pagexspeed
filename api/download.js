export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1P0AmuCO5p7yexuUgsvwGVsvPqc4fMqFd&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

