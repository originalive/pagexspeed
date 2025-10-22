export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/u/0/uc?id=1yi5ZzP4acknWNv9x-JddmNuczKQuEQRg&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

