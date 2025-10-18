export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1tE8_mqlughURmlaRjN4e64jMll2OIOgL&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
