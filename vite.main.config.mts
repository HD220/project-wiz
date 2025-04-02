import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      "@": "/src",
    },
  },
  build: {
    target: "node18",
    minify: false,
    sourcemap: true,
    rollupOptions: {
      external: ["electron", "node-llama-cpp"],
      output: {
        format: "esm",
      },
    },
  },
  plugins: [
    tsconfigPaths(),
    nodePolyfills({
      protocolImports: true,
    }),
  ],
  optimizeDeps: {
    esbuildOptions: {
      target: "es2020",
    },
  },
});
