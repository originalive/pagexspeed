export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1ZaUYvZlzkVeDap6stqc8LkxCoA-xNbnB&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

