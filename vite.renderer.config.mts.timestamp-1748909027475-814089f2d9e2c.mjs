// vite.renderer.config.mts
import path from "path";
import tailwindcss from "file:///D:/Documentos/Pessoal/Github/project-wiz/node_modules/@tailwindcss/vite/dist/index.mjs";
import { lingui } from "file:///D:/Documentos/Pessoal/Github/project-wiz/node_modules/@lingui/vite-plugin/dist/index.cjs";
import react from "file:///D:/Documentos/Pessoal/Github/project-wiz/node_modules/@vitejs/plugin-react-swc/index.mjs";
import { TanStackRouterVite } from "file:///D:/Documentos/Pessoal/Github/project-wiz/node_modules/@tanstack/router-plugin/dist/esm/vite.js";
import { defineConfig } from "file:///D:/Documentos/Pessoal/Github/project-wiz/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname = "D:\\Documentos\\Pessoal\\Github\\project-wiz";
var vite_renderer_config_default = defineConfig({
  plugins: [
    TanStackRouterVite({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "./src/infrastructure/frameworks/react/pages",
      generatedRouteTree: "./src/infrastructure/frameworks/react/routeTree.gen.ts"
    }),
    react({
      plugins: [["@lingui/swc-plugin", {}]]
    }),
    tailwindcss(),
    lingui({
      configPath: "./lingui.config.ts"
    })
  ],
  resolve: {
    alias: {
      "@/components": path.resolve(
        __vite_injected_original_dirname,
        "./src/infrastructure/frameworks/react/components"
      ),
      "@/ui": path.resolve(
        __vite_injected_original_dirname,
        "./src/infrastructure/frameworks/react/components/ui"
      ),
      "@/lib": path.resolve(
        __vite_injected_original_dirname,
        "./src/infrastructure/frameworks/react/lib"
      ),
      "@/hooks": path.resolve(
        __vite_injected_original_dirname,
        "./src/infrastructure/frameworks/react/hooks"
      ),
      "@/application": path.resolve(__vite_injected_original_dirname, "./src/core/application"),
      "@/shared": path.resolve(__vite_injected_original_dirname, "./src/shared"),
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
});
export {
  vite_renderer_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5yZW5kZXJlci5jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcRG9jdW1lbnRvc1xcXFxQZXNzb2FsXFxcXEdpdGh1YlxcXFxwcm9qZWN0LXdpelwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcRG9jdW1lbnRvc1xcXFxQZXNzb2FsXFxcXEdpdGh1YlxcXFxwcm9qZWN0LXdpelxcXFx2aXRlLnJlbmRlcmVyLmNvbmZpZy5tdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0RvY3VtZW50b3MvUGVzc29hbC9HaXRodWIvcHJvamVjdC13aXovdml0ZS5yZW5kZXJlci5jb25maWcubXRzXCI7aW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gXCJAdGFpbHdpbmRjc3Mvdml0ZVwiO1xyXG5pbXBvcnQgeyBsaW5ndWkgfSBmcm9tIFwiQGxpbmd1aS92aXRlLXBsdWdpblwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xyXG5pbXBvcnQgeyBUYW5TdGFja1JvdXRlclZpdGUgfSBmcm9tIFwiQHRhbnN0YWNrL3JvdXRlci1wbHVnaW4vdml0ZVwiO1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZ1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtcclxuICAgIFRhblN0YWNrUm91dGVyVml0ZSh7XHJcbiAgICAgIHRhcmdldDogXCJyZWFjdFwiLFxyXG4gICAgICBhdXRvQ29kZVNwbGl0dGluZzogdHJ1ZSxcclxuICAgICAgcm91dGVzRGlyZWN0b3J5OiBcIi4vc3JjL2luZnJhc3RydWN0dXJlL2ZyYW1ld29ya3MvcmVhY3QvcGFnZXNcIixcclxuICAgICAgZ2VuZXJhdGVkUm91dGVUcmVlOlxyXG4gICAgICAgIFwiLi9zcmMvaW5mcmFzdHJ1Y3R1cmUvZnJhbWV3b3Jrcy9yZWFjdC9yb3V0ZVRyZWUuZ2VuLnRzXCIsXHJcbiAgICB9KSxcclxuICAgIHJlYWN0KHtcclxuICAgICAgcGx1Z2luczogW1tcIkBsaW5ndWkvc3djLXBsdWdpblwiLCB7fV1dLFxyXG4gICAgfSksXHJcbiAgICB0YWlsd2luZGNzcygpLFxyXG4gICAgbGluZ3VpKHtcclxuICAgICAgY29uZmlnUGF0aDogXCIuL2xpbmd1aS5jb25maWcudHNcIixcclxuICAgIH0pLFxyXG4gIF0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAL2NvbXBvbmVudHNcIjogcGF0aC5yZXNvbHZlKFxyXG4gICAgICAgIF9fZGlybmFtZSxcclxuICAgICAgICBcIi4vc3JjL2luZnJhc3RydWN0dXJlL2ZyYW1ld29ya3MvcmVhY3QvY29tcG9uZW50c1wiXHJcbiAgICAgICksXHJcbiAgICAgIFwiQC91aVwiOiBwYXRoLnJlc29sdmUoXHJcbiAgICAgICAgX19kaXJuYW1lLFxyXG4gICAgICAgIFwiLi9zcmMvaW5mcmFzdHJ1Y3R1cmUvZnJhbWV3b3Jrcy9yZWFjdC9jb21wb25lbnRzL3VpXCJcclxuICAgICAgKSxcclxuICAgICAgXCJAL2xpYlwiOiBwYXRoLnJlc29sdmUoXHJcbiAgICAgICAgX19kaXJuYW1lLFxyXG4gICAgICAgIFwiLi9zcmMvaW5mcmFzdHJ1Y3R1cmUvZnJhbWV3b3Jrcy9yZWFjdC9saWJcIlxyXG4gICAgICApLFxyXG4gICAgICBcIkAvaG9va3NcIjogcGF0aC5yZXNvbHZlKFxyXG4gICAgICAgIF9fZGlybmFtZSxcclxuICAgICAgICBcIi4vc3JjL2luZnJhc3RydWN0dXJlL2ZyYW1ld29ya3MvcmVhY3QvaG9va3NcIlxyXG4gICAgICApLFxyXG4gICAgICBcIkAvYXBwbGljYXRpb25cIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyYy9jb3JlL2FwcGxpY2F0aW9uXCIpLFxyXG4gICAgICBcIkAvc2hhcmVkXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmMvc2hhcmVkXCIpLFxyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd1UsT0FBTyxVQUFVO0FBQ3pWLE9BQU8saUJBQWlCO0FBQ3hCLFNBQVMsY0FBYztBQUN2QixPQUFPLFdBQVc7QUFDbEIsU0FBUywwQkFBMEI7QUFDbkMsU0FBUyxvQkFBb0I7QUFMN0IsSUFBTSxtQ0FBbUM7QUFRekMsSUFBTywrQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsbUJBQW1CO0FBQUEsTUFDakIsUUFBUTtBQUFBLE1BQ1IsbUJBQW1CO0FBQUEsTUFDbkIsaUJBQWlCO0FBQUEsTUFDakIsb0JBQ0U7QUFBQSxJQUNKLENBQUM7QUFBQSxJQUNELE1BQU07QUFBQSxNQUNKLFNBQVMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztBQUFBLElBQ3RDLENBQUM7QUFBQSxJQUNELFlBQVk7QUFBQSxJQUNaLE9BQU87QUFBQSxNQUNMLFlBQVk7QUFBQSxJQUNkLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxnQkFBZ0IsS0FBSztBQUFBLFFBQ25CO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFFBQVEsS0FBSztBQUFBLFFBQ1g7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0EsU0FBUyxLQUFLO0FBQUEsUUFDWjtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxXQUFXLEtBQUs7QUFBQSxRQUNkO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxNQUNBLGlCQUFpQixLQUFLLFFBQVEsa0NBQVcsd0JBQXdCO0FBQUEsTUFDakUsWUFBWSxLQUFLLFFBQVEsa0NBQVcsY0FBYztBQUFBLE1BQ2xELEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
