export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1zuzp01pIdM3cikHXbUShkyiyX3ITQGah&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

