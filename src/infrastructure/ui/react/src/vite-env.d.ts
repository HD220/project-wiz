/// <reference types="vite/client" />

// Adjust the path based on your project structure and tsconfig aliases.
// This assumes preload.ts is outside the ui/react/src scope and not directly importable by default path resolution.
// A common pattern is to have a shared types directory or adjust tsconfig for such imports.
// For now, let's assume a relative path works based on typical output structures or a symlink.
// If this path causes issues, it indicates a need for a shared types package/location.
import type { IElectronAPI } from '../../../electron/preload'; // Path from vite-env.d.ts to preload.ts

declare global {
  interface Window {
    api: IElectronAPI;
  }
}
