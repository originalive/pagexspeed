export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=10BZZHJfbspp5zfeLAVP9T8oGjhlODL0t&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

