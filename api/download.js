export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1SXQaGnCWg3tHX5Yvo1qoFf6SSdRDgBYl&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
