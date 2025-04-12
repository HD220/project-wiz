import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: ".vite/build",
    rollupOptions: {
      external: [
        "better-sqlite3",
        "sqlite3",
        "keytar",
        "@node-llama-cpp",
        "node-llama-cpp"
      ],
      output: {
        entryFileNames: "main.js"
      }
    }
  }
});
