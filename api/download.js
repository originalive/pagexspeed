export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1OVJQPVoxYCH1kHbiFBD5zfqVK6a_Ztbm&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
