import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  build: {
    rollupOptions: {},
  },
});
