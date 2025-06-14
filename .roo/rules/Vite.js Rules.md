---
description: Enforce Vite.js best practices for configuration, asset handling, and build optimization.
globs: vite.*.*
alwaysApply: false
---

# **Vite.js Best Practices**

This rule set guides the AI in leveraging Vite's capabilities for fast development and optimized production builds, focusing on configuration, asset handling, and environment variables.

## **Context**

This rule applies to Vite configuration files (vite.config.js, vite.config.ts). It should be automatically attached when working on these files.

## **Requirements**

* **Vite Native Features:** Utilize Vite's native ES module imports for fast Hot Module Replacement (HMR) and development server. Avoid build-tool specific imports or configurations unless absolutely necessary.  
* **Configuration (vite.config.ts):** Keep vite.config.ts clean and minimal. Use plugins for extended functionality rather than complex custom logic directly within the config.  
* **Plugin Ecosystem:** Prefer official or well-maintained community Vite plugins for common needs (e.g., React Fast Refresh, SVG imports, asset handling).  
* **Asset Handling:** Manage static assets (images, fonts, CSS) using Vite's built-in asset handling. Use the public folder for static assets that need to be served directly without processing.  
* **Environment Variables:** Use import.meta.env for accessing environment variables, following Vite's convention. Prefix custom environment variables with VITE\_.  
* **Optimized Builds:** Assume Vite's default build optimizations (code splitting, tree-shaking) are active. Structure code to benefit from these, especially for production builds.  
* **Dev vs. Prod Configuration:** Separate development and production specific configurations within vite.config.ts using mode checks if needed, but aim for a unified approach where possible.  
* **CSS Pre-processors:** Integrate CSS pre-processors (e.g., Sass, Less) seamlessly with Vite if required, ensuring correct configuration in vite.config.ts.

## **Examples**

<example type="valid">
TypeScript

// vite.config.ts (Good)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
  },
  build: {
    sourcemap: true,
  },
});

// Example usage in component
const apiUrl = import.meta.env.VITE_API_URL;
</example>
<example type="invalid">
TypeScript

// vite.config.ts (Bad)
import { defineConfig } from 'vite';

export default defineConfig({
  // BAD: Complex logic directly in config
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  // BAD: Directly using process.env without VITE_ prefix
  define: {
    'process.env.MY_SECRET\_KEY': JSON.stringify(process.env.MY_SECRET_KEY),
  },
});
</example>