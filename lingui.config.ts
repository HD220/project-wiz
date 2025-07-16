import { defineConfig } from "@lingui/cli";

export default defineConfig({
  sourceLocale: "en",
  locales: ["en", "pt-BR"],
  // catalogsMergePath: "<rootDir>/src/renderer/locales/{locale}",
  catalogs: [
    {
      name: "common",
      path: "<rootDir>/src/renderer/locales/{locale}/common",
      include: ["<rootDir>/src/renderer/components/messages/common.tsx"],
    },
    {
      name: "validation",
      path: "<rootDir>/src/renderer/locales/{locale}/validation",
      include: ["<rootDir>/src/renderer/components/messages/validation.tsx"],
    },
    {
      name: "glossary",
      path: "<rootDir>/src/renderer/locales/{locale}/glossary",
      include: ["<rootDir>/src/renderer/components/messages/glossary.tsx"],
    },
  ],
});
