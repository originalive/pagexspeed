export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1rSzNx5AW6TVkBaldRr_p48o4nGzCztVz&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

