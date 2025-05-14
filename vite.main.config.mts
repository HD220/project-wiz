import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: { external: ["better-sqlite3"] },
  },
  resolve: {
    alias: {
      "@/core/*": path.resolve(__dirname, "./src/core"),
      "@/infrastructure/*": path.resolve(__dirname, "./src/infrastructure"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
