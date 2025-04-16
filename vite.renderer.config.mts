import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { lingui } from "@lingui/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    TanStackRouterVite({ 
      target: 'react', 
      autoCodeSplitting: true,
      routesDirectory: './src/client/pages',
      generatedRouteTree: './src/client/routeTree.gen.ts'
     }),
    react({
      plugins: [["@lingui/swc-plugin", {}]],
    }),
    tailwindcss(),
    lingui({
      configPath: "./lingui.config.ts",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
