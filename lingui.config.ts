import { defineConfig } from "@lingui/cli";

export default defineConfig({
  sourceLocale: "en",
  locales: ["en", "pt-BR"],
  // catalogsMergePath: "<rootDir>/src/infrastructure/presentation/locales/{locale}",
  catalogs: [
    {
      name: "common",
      path: "<rootDir>/src/infrastructure/presentation/locales/{locale}/common",
      include: ["<rootDir>/src/infrastructure/presentation/components/messages/common.tsx"],
    },
    {
      name: "validation",
      path: "<rootDir>/src/infrastructure/presentation/locales/{locale}/validation",
      include: ["<rootDir>/src/infrastructure/presentation/components/messages/validation.tsx"],
    },
    {
      name: "glossary",
      path: "<rootDir>/src/infrastructure/presentation/locales/{locale}/glossary",
      include: ["<rootDir>/src/infrastructure/presentation/components/messages/glossary.tsx"],
    },
  ],
});
