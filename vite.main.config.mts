import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      // Externalize the native dependency and the main module so that Rollup does not attempt to bundle them.
      external: ["@node-llama-cpp", "node-llama-cpp"],
    },
  },
});
