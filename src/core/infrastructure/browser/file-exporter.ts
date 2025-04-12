export interface FileExporter {
  exportFile(data: string | Blob, filename: string, mimeType?: string): void;
}

export class BrowserFileExporter implements FileExporter {
  exportFile(data: string | Blob, filename: string, mimeType: string = "application/json"): void {
    const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Default instance for browser usage
export const fileExporter: FileExporter = new BrowserFileExporter();