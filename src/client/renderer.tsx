import { useEffect } from 'react';
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

  useEffect(() => {
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none';";
    document.head.appendChild(cspMeta);

    const xContentTypeOptionsMeta = document.createElement('meta');
    xContentTypeOptionsMeta.httpEquiv = 'X-Content-Type-Options';
    xContentTypeOptionsMeta.content = 'nosniff';
    document.head.appendChild(xContentTypeOptionsMeta);

    const xFrameOptionsMeta = document.createElement('meta');
    xFrameOptionsMeta.httpEquiv = 'X-Frame-Options';
    xFrameOptionsMeta.content = 'DENY';
    document.head.appendChild(xFrameOptionsMeta);

    const referrerPolicyMeta = document.createElement('meta');
    referrerPolicyMeta.name = 'referrer';
    referrerPolicyMeta.content = 'no-referrer';
    document.head.appendChild(referrerPolicyMeta);

    const permissionsPolicyMeta = document.createElement('meta');
    permissionsPolicyMeta.httpEquiv = 'Permissions-Policy';
    permissionsPolicyMeta.content = 'geolocation=(), microphone=(), camera=(), fullscreen=(), payment=()';
    document.head.appendChild(permissionsPolicyMeta);

    const sandboxMeta = document.createElement('meta');
    sandboxMeta.name = 'sandbox';
    sandboxMeta.content = 'allow-scripts allow-same-origin';
    document.head.appendChild(sandboxMeta);
  }, []);
});

console.log(
  '👋 This message is being logged by "renderer.ts", included via Vite'
);
