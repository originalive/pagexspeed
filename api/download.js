export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1WB7RCWu4mfOGpE9LQYaw-8f2Tid5JlET&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

