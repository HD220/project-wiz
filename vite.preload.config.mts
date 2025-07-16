import { defineConfig } from "vite";
import path from "path"; // Import path

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: {
      "@/": path.resolve(__dirname, "./src"),
    },
  },
});
