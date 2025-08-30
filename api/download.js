export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1XrOmaZSgWNEL1MzdUEtkySDXmrtR1wfm&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}
