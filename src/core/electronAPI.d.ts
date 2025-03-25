export interface ElectronAPI {
  onDownloadProgress: (
    callback: (data: { progress: number }) => void
  ) => () => void;
  onLoadProgress: (
    callback: (data: { progress: number }) => void
  ) => () => void;
  // run: (text: string) => void;
  // onResponse: (callback: (response: string) => void) => void;
  // onError: (callback: (error: string) => void) => void;
  // onStateChange: (callback: (state: string) => void) => void;
  // onTextChunk: (callback: (text: string) => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
