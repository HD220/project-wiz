import "./styles/global.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "./components/providers/theme.tsx";

const root = document.getElementById("root")!;

createRoot(root).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </StrictMode>
);

console.log(
  '👋 This message is being logged by "renderer.ts", included via Vite'
);
