export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=11B23kkExxAQOZd3NNyYT9-drMgIC3JHG&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

