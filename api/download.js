export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=12yvnwIW1bi4BYHGR0_fmSbdHqweqM0rl&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
