import { defineConfig } from "@lingui/cli";

export default defineConfig({
  sourceLocale: "en",
  locales: ["en", "pt-BR"],
  catalogs: [
    {
      name: "common",
      path: "<rootDir>/src/locales/{locale}/common",
      include: ["<rootDir>/src/client/components/messages/common.tsx"],
    },
    {
      name: "validation",
      path: "<rootDir>/src/locales/{locale}/validation",
      include: ["<rootDir>/src/client/components/messages/validation.tsx"],
    },
    {
      name: "glossary",
      path: "<rootDir>/src/locales/{locale}/glossary",
      include: ["<rootDir>/src/client/components/messages/glossary.tsx"],
    },
  ],
});
