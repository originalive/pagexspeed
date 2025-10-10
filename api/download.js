export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1bSVhtbOhdqn1EjgZoLm938JCyM1ogN9U&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
