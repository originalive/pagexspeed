export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=19ZZLUJ_0H_QmU-WzIf8tL1SKTrHRhvwG&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

