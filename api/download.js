export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1PGm9wE6T7x8OfJaYZV94NhPKRRG9dAUH&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

