import { fileExporter } from "../../core/infrastructure/browser/file-exporter";

export function exportDataAsFile(
  data: string | Blob,
  filename: string,
  mimeType: string = "application/json"
): void {
  fileExporter.exportFile(data, filename, mimeType);
}