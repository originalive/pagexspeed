export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1kVnOO0erv9qJp9IJm6ykIyJA_rfpCxk3&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

