import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function modelDownload({
  uri,
  onProgress
}:{uri: string, onProgress?: (status: {
  totalSize: number;
  downloadedSize: number;
}) => void}) {
  const { createModelDownloader } = await import("node-llama-cpp");
  const downloader = await createModelDownloader({
    modelUri: uri,
    dirPath: path.join(__dirname, "models"),
    parallelDownloads: 5,
    deleteTempFileOnCancel: true,
    showCliProgress: false,
    skipExisting: true,
    onProgress,
  });
  const modelPath = await downloader.download();

  return modelPath;
}
