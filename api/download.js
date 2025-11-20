export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1c5AhHD8fqQduvufdlDh2QytBpxKzZWf7&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

