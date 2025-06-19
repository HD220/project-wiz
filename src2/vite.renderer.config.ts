import type { ConfigEnv, UserConfig } from 'vite';
import { builtinModules } from 'node:module';
import react from '@vitejs/plugin-react-swc'; // Using swc for faster HMR
import { join } from 'node:path';

export default ({ command, mode }: ConfigEnv): UserConfig => {
  return {
    // Set "chrome" as the target of the renderer process, otherwise some
    // APIs (such as `vite:preload-*`) will not be available.
    target: 'chrome',
    // React fast HMR in Vite.
    // https://github.com/vitejs/vite-plugin-react-swc
    plugins: [react()],
    build: {
      // Prevent multiple builds from interfering with each other.
      emptyOutDir: false,
      // Electron 12.0.0+ (Node.js 14.16.0+)
      // https://github.com/electron/electron/blob/v12.0.0/docs/breaking-changes.md#removed-remote-module
      // Node.js 14.16.0+
      // https://nodejs.org/en/blog/release/v14.16.0
      // https://github.com/electron-vite/vite-plugin-electron/blob/v0.7.3/src/index.ts#L37-L39
      // TODO: Do I need this? The target is Node.js 18.18 / Electron 29
      // target: 'node14.16',
      // TODO: This may be different for Electron. Usually, it's not a library.
      // The output directory is `dist/renderer`.
      outDir: 'dist/renderer',
      rollupOptions: {
        // Externalize Node.js builtin modules.
        external: [
          ...builtinModules.flatMap(p => [p, `node:${p}`]),
        ],
        // Ensure that the entry point is `index.html`.
        input: 'index.html',
      },
    },
    resolve: {
      alias: {
        // @/* -> src/*
        '@': join(process.cwd(), 'src'),
      },
    },
    // Vite will copy files from the `public` directory to the `dist/renderer` directory.
    publicDir: 'public',
    // Configure the development server.
    server: {
      //port: 3000, // You can specify a port if needed
      // Make the development server listen on all addresses.
      // This is required for HMR to work.
      host: '0.0.0.0',
    },
  };
};
