export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1TtofdKk2XYpmoEHgcEuJZwqumLvYHdpc&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
