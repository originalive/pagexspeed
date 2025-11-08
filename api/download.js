export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1923nst1PMeMiEcRuT1nJhv1crmJhlTtM&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

