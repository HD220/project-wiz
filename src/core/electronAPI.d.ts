export interface LlamaAPI {}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
