export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1VJNyCjROwOevRjBR0PBmkj9t3imkZMRU&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

