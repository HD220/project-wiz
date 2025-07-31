// vite.renderer.config.mts
import { lingui } from "file:///mnt/d/Documentos/Pessoal/Github/project-wiz/node_modules/@lingui/vite-plugin/dist/index.cjs";
import tailwindcss from "file:///mnt/d/Documentos/Pessoal/Github/project-wiz/node_modules/@tailwindcss/vite/dist/index.mjs";
import { tanstackRouter } from "file:///mnt/d/Documentos/Pessoal/Github/project-wiz/node_modules/@tanstack/router-plugin/dist/esm/vite.js";
import react from "file:///mnt/d/Documentos/Pessoal/Github/project-wiz/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { defineConfig } from "file:///mnt/d/Documentos/Pessoal/Github/project-wiz/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname =
  "/mnt/d/Documentos/Pessoal/Github/project-wiz";
var projectRoot = path.resolve(__vite_injected_original_dirname);
var vite_renderer_config_default = defineConfig({
  root: path.resolve(projectRoot, "src/renderer"),
  plugins: [
    tanstackRouter({
      target: "react",
      // autoCodeSplitting: true,
      routesDirectory: path.resolve(projectRoot, "src/renderer/app"),
      generatedRouteTree: path.resolve(
        projectRoot,
        "src/renderer/routeTree.gen.ts",
      ),
    }),
    react({
      plugins: [["@lingui/swc-plugin", {}]],
    }),
    tailwindcss(),
    lingui({
      configPath: path.resolve(projectRoot, "lingui.config.ts"),
    }),
  ],
  resolve: {
    alias: {
      "@/ui": path.resolve(projectRoot, "./src/renderer/components/ui/"),
      "@/components": path.resolve(projectRoot, "src/renderer/components/"),
      "@/lib": path.resolve(projectRoot, "./src/renderer/lib/"),
      "@/hooks": path.resolve(projectRoot, "./src/renderer/hooks/"),
      "@/features": path.resolve(projectRoot, "./src/renderer/features/"),
      "@": path.resolve(projectRoot, "./src/"),
    },
  },
});
export { vite_renderer_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5yZW5kZXJlci5jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL21udC9kL0RvY3VtZW50b3MvUGVzc29hbC9HaXRodWIvcHJvamVjdC13aXpcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9tbnQvZC9Eb2N1bWVudG9zL1Blc3NvYWwvR2l0aHViL3Byb2plY3Qtd2l6L3ZpdGUucmVuZGVyZXIuY29uZmlnLm10c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vbW50L2QvRG9jdW1lbnRvcy9QZXNzb2FsL0dpdGh1Yi9wcm9qZWN0LXdpei92aXRlLnJlbmRlcmVyLmNvbmZpZy5tdHNcIjtpbXBvcnQgeyBsaW5ndWkgfSBmcm9tIFwiQGxpbmd1aS92aXRlLXBsdWdpblwiO1xuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gXCJAdGFpbHdpbmRjc3Mvdml0ZVwiO1xuaW1wb3J0IHsgdGFuc3RhY2tSb3V0ZXIgfSBmcm9tIFwiQHRhbnN0YWNrL3JvdXRlci1wbHVnaW4vdml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuXG5jb25zdCBwcm9qZWN0Um9vdCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUpO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICByb290OiBwYXRoLnJlc29sdmUocHJvamVjdFJvb3QsIFwic3JjL3JlbmRlcmVyXCIpLFxuICBwbHVnaW5zOiBbXG4gICAgdGFuc3RhY2tSb3V0ZXIoe1xuICAgICAgdGFyZ2V0OiBcInJlYWN0XCIsXG4gICAgICAvLyBhdXRvQ29kZVNwbGl0dGluZzogdHJ1ZSxcbiAgICAgIHJvdXRlc0RpcmVjdG9yeTogcGF0aC5yZXNvbHZlKHByb2plY3RSb290LCBcInNyYy9yZW5kZXJlci9hcHBcIiksXG4gICAgICBnZW5lcmF0ZWRSb3V0ZVRyZWU6IHBhdGgucmVzb2x2ZShcbiAgICAgICAgcHJvamVjdFJvb3QsXG4gICAgICAgIFwic3JjL3JlbmRlcmVyL3JvdXRlVHJlZS5nZW4udHNcIixcbiAgICAgICksXG4gICAgfSksXG4gICAgcmVhY3Qoe1xuICAgICAgcGx1Z2luczogW1tcIkBsaW5ndWkvc3djLXBsdWdpblwiLCB7fV1dLFxuICAgIH0pLFxuICAgIHRhaWx3aW5kY3NzKCksXG4gICAgbGluZ3VpKHtcbiAgICAgIGNvbmZpZ1BhdGg6IHBhdGgucmVzb2x2ZShwcm9qZWN0Um9vdCwgXCJsaW5ndWkuY29uZmlnLnRzXCIpLFxuICAgIH0pLFxuICBdLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQC91aVwiOiBwYXRoLnJlc29sdmUocHJvamVjdFJvb3QsIFwiLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy91aS9cIiksXG4gICAgICBcIkAvY29tcG9uZW50c1wiOiBwYXRoLnJlc29sdmUocHJvamVjdFJvb3QsIFwic3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvXCIpLFxuICAgICAgXCJAL2xpYlwiOiBwYXRoLnJlc29sdmUocHJvamVjdFJvb3QsIFwiLi9zcmMvcmVuZGVyZXIvbGliL1wiKSxcbiAgICAgIFwiQC9ob29rc1wiOiBwYXRoLnJlc29sdmUocHJvamVjdFJvb3QsIFwiLi9zcmMvcmVuZGVyZXIvaG9va3MvXCIpLFxuICAgICAgXCJAL2ZlYXR1cmVzXCI6IHBhdGgucmVzb2x2ZShwcm9qZWN0Um9vdCwgXCIuL3NyYy9yZW5kZXJlci9mZWF0dXJlcy9cIiksXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKHByb2plY3RSb290LCBcIi4vc3JjL1wiKSxcbiAgICB9LFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTBVLFNBQVMsY0FBYztBQUNqVyxPQUFPLGlCQUFpQjtBQUN4QixTQUFTLHNCQUFzQjtBQUMvQixPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsb0JBQW9CO0FBTDdCLElBQU0sbUNBQW1DO0FBT3pDLElBQU0sY0FBYyxLQUFLLFFBQVEsZ0NBQVM7QUFFMUMsSUFBTywrQkFBUSxhQUFhO0FBQUEsRUFDMUIsTUFBTSxLQUFLLFFBQVEsYUFBYSxjQUFjO0FBQUEsRUFDOUMsU0FBUztBQUFBLElBQ1AsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBO0FBQUEsTUFFUixpQkFBaUIsS0FBSyxRQUFRLGFBQWEsa0JBQWtCO0FBQUEsTUFDN0Qsb0JBQW9CLEtBQUs7QUFBQSxRQUN2QjtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRCxNQUFNO0FBQUEsTUFDSixTQUFTLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7QUFBQSxJQUN0QyxDQUFDO0FBQUEsSUFDRCxZQUFZO0FBQUEsSUFDWixPQUFPO0FBQUEsTUFDTCxZQUFZLEtBQUssUUFBUSxhQUFhLGtCQUFrQjtBQUFBLElBQzFELENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxRQUFRLEtBQUssUUFBUSxhQUFhLCtCQUErQjtBQUFBLE1BQ2pFLGdCQUFnQixLQUFLLFFBQVEsYUFBYSwwQkFBMEI7QUFBQSxNQUNwRSxTQUFTLEtBQUssUUFBUSxhQUFhLHFCQUFxQjtBQUFBLE1BQ3hELFdBQVcsS0FBSyxRQUFRLGFBQWEsdUJBQXVCO0FBQUEsTUFDNUQsY0FBYyxLQUFLLFFBQVEsYUFBYSwwQkFBMEI7QUFBQSxNQUNsRSxLQUFLLEtBQUssUUFBUSxhQUFhLFFBQVE7QUFBQSxJQUN6QztBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
