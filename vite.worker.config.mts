import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  build: {
    // outDir: path.resolve(__dirname, ".vite/build"),
    // lib: {
    //   entry: path.resolve(__dirname, "src/core/llama/llama-worker.ts"),
    //   name: "LlamaWorker",
    //   fileName: "llama-worker",
    //   formats: ["cjs"],
    // },
    rollupOptions: {
      external: ["node-llama-cpp", "@node-llama-cpp"],
      // output: {
      //   entryFileNames: "llama/llama-worker.js",
      //   preserveModules: false,
      //   interop: "auto",
      // },
    },
  },
  // resolve: {
  //   alias: {
  //     "@": path.resolve(__dirname, "./src"),
  //   },
  // },
});
