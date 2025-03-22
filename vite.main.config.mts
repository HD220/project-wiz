import { defineConfig } from "vite";

const external: string[] = ["node-llama-cpp", "@node-llama-cpp"];

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external,
    },
  },
});
