import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  build: {
    rollupOptions: {
      external: ["node-llama-cpp", "@node-llama-cpp"],
    },
  },
});
