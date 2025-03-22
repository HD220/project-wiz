import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function modelDownload(uri: string) {
  const { createModelDownloader } = await import("node-llama-cpp");
  const downloader = await createModelDownloader({
    modelUri: uri,
    dirPath: path.join(__dirname, "models"),
    parallelDownloads: 5,
    deleteTempFileOnCancel: true,
    showCliProgress: true,
    skipExisting: true,
    onProgress: (status) => {
      console.log("status:", status);
    },
    // showCliProgress: true,
  });
  const modelPath = await downloader.download();

  return modelPath;
}
