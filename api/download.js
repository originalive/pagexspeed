export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=16AK9AQRDSilQ6g_2C7E_SqEAto-1zF7M&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

