import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./styles/globals.css";

import App from "./main";
import { detectLocale, dynamicActivate } from "./i18n";

const root = createRoot(document.getElementById("root")!);

dynamicActivate(detectLocale()).then(() => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});

console.log(
  '👋 This message is being logged by "renderer.ts", included via Vite'
);
