export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1u5IB1sHaaOfMZVRIvZuk7RHKrodBLK_X&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
