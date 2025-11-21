export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1kNIB8dEMFkb1g8oqDEHmLI4GLps5id4m&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

