export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1Hh8jWVZI2KZUQhcZ__NOGk7ntI0sGMaj&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

