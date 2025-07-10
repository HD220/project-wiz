import { ElectronIPC } from "./preload";

declare global {
  interface Window {
    electronIPC: ElectronIPC;
  }
}
