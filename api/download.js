export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1MfoUOzWf1bDkB379DN2-2YRk_rv3UeE9&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

