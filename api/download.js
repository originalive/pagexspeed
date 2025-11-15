export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1YDz96MHoNz9nmgwIH8j66SkDDb-83hgk&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

