import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    outDir: '.vite/build',
    lib: {
      entry: path.resolve(__dirname, 'src/core/llama/llama-worker.ts'),
      name: 'LlamaWorker',
      fileName: 'llama-worker',
      formats: ['cjs']
    },
    rollupOptions: {
      external: ['node-llama-cpp', 'path', 'process'],
      output: {
        entryFileNames: 'llama/llama-worker.js',
        preserveModules: false,
        interop: 'auto'
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
