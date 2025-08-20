export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1mUgKekkb5V7z5Mar4z6OgM07HofvACaK&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
