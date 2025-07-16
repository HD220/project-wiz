import { IElectronIPC } from "./preload";

declare global {
  interface Window {
    electronIPC: IElectronIPC;
  }
}
