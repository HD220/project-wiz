import { defineConfig } from "@lingui/cli";

export default defineConfig({
  sourceLocale: "en",
  locales: ["en", "pt-BR"],
  catalogs: [
    {
      name: "common",
      path: "<rootDir>/src/renderer/locales/{locale}/common",
      include: ["<rootDir>/src/renderer/**/*.{ts,tsx}"],
    },
    {
      name: "validation",
      path: "<rootDir>/src/renderer/locales/{locale}/validation",
      include: ["<rootDir>/src/renderer/**/*.{ts,tsx}"],
    },
    {
      name: "glossary",
      path: "<rootDir>/src/renderer/locales/{locale}/glossary",
      include: ["<rootDir>/src/renderer/**/*.{ts,tsx}"],
    },
  ],
});
