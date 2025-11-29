export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1058hUJOfaKTLkGYuO3j2EOay80rZMG2K&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

