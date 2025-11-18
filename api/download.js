export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1d2kgVknHqHcwdBhYrRyrhB6jnkBF2nYL&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

