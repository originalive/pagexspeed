export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=18NaWjmzEYsJpIyul_cbBhmLYV8AVMLur&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
