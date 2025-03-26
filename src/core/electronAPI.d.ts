export type ElectronAPI = {};

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
