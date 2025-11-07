export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1ti7FJcSvGN-4IX-nWnLmiXK9jgdNMdBl&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

