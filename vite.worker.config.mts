import path from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    rollupOptions: {
      external: [
        "better-sqlite3", 
        "pino", 
        "pino-pretty",
        "@xenova/transformers",
        "onnxruntime-node",
        "sharp",
		"sqlite-vec"
      ],
    },
  },
  resolve: {
    alias: {
      "@/": path.resolve(__dirname, "./src"),
    },
  },
});
