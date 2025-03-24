export interface ProgressEvent {
  progress: number;
}

export interface ModelDownloadAPI {
  downloadModel: (
    modelId: string,
    onProgress: (progress: number) => void
  ) => Promise<void>;
}

export interface ProgressListenerAPI {
  onDownloadProgress: (callback: (event: ProgressEvent) => void) => () => void;

  onLoadProgress: (callback: (event: ProgressEvent) => void) => () => void;
}

export type ElectronAPI = ModelDownloadAPI & ProgressListenerAPI;

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
