export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1-023Bu3r7WtMeGgq7H14nYdazvx4RUlU&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

