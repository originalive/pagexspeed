export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1rk6g_lsanYhXUyZI90yw8jacAkKLBaXy&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
