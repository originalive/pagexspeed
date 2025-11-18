export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1D1rNmJPROUJwbI3yqY68mqZzl_0_mOj8&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

