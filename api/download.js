export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1sTfGaaDFl9KRRS-h5KK5TH_mm1uHETwe&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

