export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1rwV12lk0C0TEfg_C0sA-k3lu1xnUiqAF&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
