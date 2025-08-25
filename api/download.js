export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1J23rSXJ9RZ0YbhArd4cUG0VsAx_w5yDC&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
