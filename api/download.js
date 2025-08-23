export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=125snwDfSGFPW4dzPyy6LV8V8cM-dh6HQ&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
