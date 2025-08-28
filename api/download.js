export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1vQoodPQWXhTkwo2wtAkFmU39ZQtfrsFy&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
