import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { lingui } from "@lingui/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { defineConfig } from "vite";
import noncePlugin from "./vite.nonce-plugin.mts";

// https://vitejs.dev/config
export default defineConfig({
  server: {
    headers: {
      "Content-Security-Policy": [
        "default-src 'self'",
        "script-src 'self' 'nonce-__NONCE__'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "connect-src 'self'",
        "font-src 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "base-uri 'self'"
      ].join('; ')
    }
  },
  plugins: [
    noncePlugin(),
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
