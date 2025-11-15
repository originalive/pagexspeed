export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1clQPJnidhZ23Rfyo2hihbggS9rS9HplR&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

