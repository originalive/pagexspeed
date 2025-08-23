export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1kUry8PLW0R8ans4vfyynXJJkjAcLTme9&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
