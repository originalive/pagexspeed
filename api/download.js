export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1XNfFUvmpBA960a_iBdpmTnaD0m3h1Bgj&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

