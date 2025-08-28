export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1bThljnhu8WQCe2TXAQWRF1OlnX8DhgI1&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
