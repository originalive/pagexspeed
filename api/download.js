export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1L5kdwvceM9QcPp6hxejvrSxRjXbLPE6G&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
