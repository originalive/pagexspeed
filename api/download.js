export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1S1r_qo5bl2CvyWzhC3QCt0orY_17fDZb&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

