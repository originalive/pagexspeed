export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1mwIB3YJudfdrTSBeWVLSSiB2eEqYcVdF&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
