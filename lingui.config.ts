import { defineConfig } from "@lingui/cli";

export default defineConfig({
  sourceLocale: "en",
  locales: ["en", "pt-BR"],
  // catalogsMergePath: "<rootDir>/src/presentation/ui/locales/{locale}",
  catalogs: [
    {
      name: "common",
      path: "<rootDir>/src/presentation/ui/locales/{locale}/common",
      include: ["<rootDir>/src/presentation/ui/components/messages/common.tsx"],
    },
    {
      name: "validation",
      path: "<rootDir>/src/presentation/ui/locales/{locale}/validation",
      include: [
        "<rootDir>/src/presentation/ui/components/messages/validation.tsx",
      ],
    },
    {
      name: "glossary",
      path: "<rootDir>/src/presentation/ui/locales/{locale}/glossary",
      include: [
        "<rootDir>/src/presentation/ui/components/messages/glossary.tsx",
      ],
    },
  ],
});
