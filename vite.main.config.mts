import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions:{
      external: ["better-sqlite3", "sqlite3","keytar","@node-llama-cpp","node-llama-cpp"],
    }
  },
});
