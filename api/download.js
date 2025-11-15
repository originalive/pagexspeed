export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1B01jOQCjijAT8FREE8OufNkqdD6p_QYe&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

