export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1vW5qde5leNTYUzCWbLhR3OnmuljEi4w0&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
