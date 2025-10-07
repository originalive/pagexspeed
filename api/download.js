export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=17V-5VW_JdLuN06JAekiI0t6y7N3OSqlH&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
