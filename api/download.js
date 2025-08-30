export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1kYkPhrFTSic6I8DgquMSK6RroLK96iLV&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
