export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1wty2VT21IwUWGs-CFg5yq2q7rvGtooX4&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

