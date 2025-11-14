export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1BdfsPS8iz0gSRuqmcO3uI76fXg10QcVw&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

