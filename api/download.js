export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1qMaUlCsw04RS2Z7Y7QL0FygzZdDP15hw&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
