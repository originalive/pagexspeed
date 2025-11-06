export default function handler(request, response) {
const extensionDownloadUrl = "https://drive.usercontent.google.com/uc?id=1t5hvsahh23vjjTKeLjDOiFVMlXUdFIQz&export=download";
  response.status(200).json({
    url: extensionDownloadUrl,
  });
}

