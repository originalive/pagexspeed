export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1dr648Erp4UZlOA2mZDXfnFlf_sDohsjY&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
