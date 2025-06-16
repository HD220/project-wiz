import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: { external: ["better-sqlite3"] },
  },
  resolve: {
    alias: {
      "@/core": path.resolve(__dirname, "./src/core"),
      "@/shared": path.resolve(__dirname, "./src/shared"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
