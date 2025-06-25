import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { lingui } from "@lingui/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  // Adicionar a configuração de 'root' para o Vite encontrar o index.html
  root: path.resolve(__dirname, "./src_refactored/presentation/ui"), // NOVA CONFIGURAÇÃO DE ROOT
  plugins: [
    TanStackRouterVite({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: path.resolve(__dirname, "./src_refactored/presentation/ui/app"), // CAMINHO ATUALIZADO PARA APP
      generatedRouteTree: path.resolve(__dirname, "./src_refactored/presentation/ui/routeTree.gen.ts"), // CAMINHO ATUALIZADO
    }),
    react({
      plugins: [["@lingui/swc-plugin", {}]], // Manter, mas a configuração do LinguiJS (FE-SETUP-004) precisará ser reavaliada
    }),
    tailwindcss(), // Manter, mas o config do tailwind precisará apontar para os novos arquivos em src_refactored
    lingui({ // Manter, mas a configuração do LinguiJS (FE-SETUP-004) precisará ser reavaliada
      configPath: "./lingui.config.ts", // Este caminho pode precisar ser ajustado se o lingui.config.ts for movido ou se referir a paths relativos
    }),
  ],
  resolve: {
    alias: {
      "@/": path.resolve(__dirname, "./src_refactored/presentation/ui"),
      "@/assets": path.resolve(__dirname, "./src_refactored/presentation/ui/assets"),
      "@/components/common": path.resolve(__dirname, "./src_refactored/presentation/ui/components/common"),
      "@/components/layout": path.resolve(__dirname, "./src_refactored/presentation/ui/components/layout"),
      "@/components/ui": path.resolve(__dirname, "./src_refactored/presentation/ui/components/ui"),
      "@/config": path.resolve(__dirname, "./src_refactored/presentation/ui/config"),
      "@/features": path.resolve(__dirname, "./src_refactored/presentation/ui/features"),
      "@/hooks": path.resolve(__dirname, "./src_refactored/presentation/ui/hooks"),
      "@/lib": path.resolve(__dirname, "./src_refactored/presentation/ui/lib"),
      "@/services": path.resolve(__dirname, "./src_refactored/presentation/ui/services"),
      "@/store": path.resolve(__dirname, "./src_refactored/presentation/ui/store"),
      "@/styles": path.resolve(__dirname, "./src_refactored/presentation/ui/styles"),
      "@/types": path.resolve(__dirname, "./src_refactored/presentation/ui/types"),
      // Manter o alias @/shared para src/shared, pois pode conter tipos úteis.
      "@/shared": path.resolve(__dirname, "./src/shared"),
    },
  },
  // Adicionar a configuração de build para que o output vá para um local que o Electron Forge possa pegar
  build: {
    outDir: path.resolve(__dirname, ".vite/renderer/main_window"), // Diretório de saída padrão do Electron Forge Vite plugin
  }
});
