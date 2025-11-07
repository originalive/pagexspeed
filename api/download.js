export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1tDYelFS2L5kntAxNh0OBCHrpivL5Iqog&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

