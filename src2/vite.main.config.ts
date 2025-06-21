import type { ConfigEnv, UserConfig } from 'vite';
import { builtinModules } from 'node:module';
import { join } from 'node:path';

export default ({ command, mode }: ConfigEnv): UserConfig => {
  return {
    // Set "node" as the target of the main process, otherwise some
    // Electron APIs will not be available.
    target: 'node',
    // ESBuild is faster than SWC, and the main process has a lower tolerance for
    // build time, so ESBuild is a good choice.
    // https://github.com/electron-vite/electron-vite-react/pull/94
    esbuild: {},
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
      // Compile to a CommonJS module.
      lib: {
        entry: 'electron/main.ts',
        formats: ['cjs'],
      },
      rollupOptions: {
        // Externalize Node.js builtin modules.
        external: [
          'electron',
          ...builtinModules.flatMap(p => [p, `node:${p}`]),
        ],
        output: {
          entryFileNames: '[name].js',
        },
      },
    },
    resolve: {
      alias: {
        // @/* -> src/*
        '@': join(process.cwd(), 'src'),
      },
    },
  };
};
