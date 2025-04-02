import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  build: {
    outDir: ".vite/build",
    lib: {
      entry: path.resolve(
        __dirname,
        "src/core/services/llm/llama/worker-bridge.ts"
      ),
      name: "workerBridge",
      formats: ["cjs"],
      fileName: () => "worker-bridge.js",
    },
    rollupOptions: {
      external: ["node-llama-cpp", "@node-llama-cpp", "electron"],
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
    minify: false,
    sourcemap: true,
  },
});
