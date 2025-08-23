export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1wqJ4ryIgdHTxZdnWRWSSF9CWomgdyTM9&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
