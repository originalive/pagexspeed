export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1Q0vFpXxgcwi8QK_FEJWJVy8jQnO6cizg&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

