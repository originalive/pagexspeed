export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1I7Ck0Sazq_wj95zb-wErMXWu4DHZAmIX&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

