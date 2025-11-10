export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=10b-ibZqiShn6Bou218ewlB2TSxlyXBXc&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

