export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1s7cMnUgd0h63EWAanOGt95Wm0hmCLn1L&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
