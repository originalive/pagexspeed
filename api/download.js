export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=106pRA13SEgxM6224vkPiciuzUi9R8wAU&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

