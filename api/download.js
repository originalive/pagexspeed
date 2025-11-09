export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1CUNthnaHHmoyu_uVCuiPQklWHGT0gNnJ&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

