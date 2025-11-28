export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1e9UqnzwqJirA8MSeMt7IYYTkCbiDicLS&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

