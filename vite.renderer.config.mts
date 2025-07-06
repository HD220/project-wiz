import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { lingui } from "@lingui/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";

const projectRoot = path.resolve(__dirname);

export default defineConfig({
  root: path.resolve(projectRoot, "src/presentation/ui"), // Corrected root
  // build: {
  //   outDir: `./vite/renderer/`,
  // },
  plugins: [
    tanstackRouter({
      target: "react",
      // autoCodeSplitting: true,
      routesDirectory: path.resolve(projectRoot, "src/presentation/ui/app"),
      generatedRouteTree: path.resolve(
        projectRoot,
        "src/presentation/ui/routeTree.gen.ts"
      ),
    }),
    react({
      plugins: [["@lingui/swc-plugin", {}]],
    }),
    tailwindcss(),
    lingui({
      configPath: path.resolve(projectRoot, "lingui.config.ts"), // Make absolute from projectRoot
    }),
  ],
  resolve: {
    alias: {
      // Specific alias for @/ui to point to the presentation/ui directory
      "@/ui": path.resolve(projectRoot, "src/presentation/ui"),
      // Alias for @/components to point to the presentation/ui/components directory
      "@/components": path.resolve(
        projectRoot,
        "src/presentation/ui/components"
      ),
      // Alias for @/shared for shared types and utilities
      "@/shared": path.resolve(projectRoot, "src/shared"),
      // Add other specific @/ aliases if the renderer needs them from other parts of src
      // For example, if it directly imported from @/core (though unlikely for renderer)
      // "@/core": path.resolve(projectRoot, "src/core"),
    },
  },
});
