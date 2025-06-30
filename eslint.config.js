// @ts-check
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import vitestPlugin from "eslint-plugin-vitest";
import * as importPlugin from "eslint-plugin-import";
import boundariesPlugin from "eslint-plugin-boundaries";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactPlugin from "eslint-plugin-react";
import globals from "globals";

export default [
  {
    // Universal ignores
    ignores: [
      "**/_old/**",
      "**/coverage/**",
      "**/dist/**",
      "**/node_modules/**",
      "tests/**",
      "**/k6/**",
      "**/jslib.k6.io/**",
      "backup/**",
      "src/**",
      "src2/**",
      "scripts/**",
      ".vite/**",
      "*.config.js",
      "*.config.ts",
      "*.config.cts",
      "*.mts",
      "index.html",
      "docs/**",
      "migrations/**",
      "public/**",
      ".jules/**",
      ".roo/**",
      "types/**"
    ],
  },
  // Base Configuration for files within src_refactored
  {
    files: ["src_refactored/**/*.ts", "src_refactored/**/*.tsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...vitestPlugin.environments.env.globals,
        ...globals.node,
        ...globals.browser,
        window: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      import: importPlugin,
      vitest: vitestPlugin,
      // boundaries: boundariesPlugin, // Temporarily commented out
      "react-hooks": reactHooksPlugin,
      react: reactPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      ...vitestPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // Not needed with new JSX transform
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
      "import/no-unresolved": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/naming-convention": ["warn",
        { "selector": "default", "format": ["camelCase"], "leadingUnderscore": "allow", "trailingUnderscore": "allow" },
        { "selector": "import", "format": ["camelCase", "PascalCase", "UPPER_CASE"], "leadingUnderscore": "allow", "trailingUnderscore": "allow" },
        { "selector": "variable", "format": ["camelCase", "PascalCase", "UPPER_CASE"], "leadingUnderscore": "allow", "trailingUnderscore": "allow" },
        { "selector": "function", "format": ["camelCase", "PascalCase"] },
        { "selector": "parameter", "format": ["camelCase"], "leadingUnderscore": "allow" },
        { "selector": "typeLike", "format": ["PascalCase"] },
        { "selector": "enumMember", "format": ["PascalCase", "UPPER_CASE"] },
        { "selector": "objectLiteralProperty", "format": ["camelCase", "PascalCase", "UPPER_CASE", "snake_case"], "leadingUnderscore": "allow", "trailingUnderscore": "allow" },
        { "selector": "classProperty", "modifiers": ["static", "readonly"], "format": ["UPPER_CASE", "camelCase", "PascalCase"] }
      ],
      "max-depth": ["warn", { "max": 4 }],
      "no-else-return": "warn",
      "id-length": ["warn", { "min": 2, "exceptions": ["_"] }],
      "max-statements": ["warn", { "max": 25 }],
      "max-lines-per-function": ["error", { "max": 50, "skipBlankLines": true, "skipComments": true }],
      "max-lines": ["error", { "max": 200, "skipBlankLines": true, "skipComments": true }],
      // Comment Rules
      "@typescript-eslint/ban-ts-comment": ["error", {
        "ts-expect-error": "allow-with-description",
        "ts-ignore": true, // Ban @ts-ignore
        "ts-nocheck": true, // Ban @ts-nocheck
        "ts-check": false,  // Allow @ts-check
        "minimumDescriptionLength": 3
      }],
      "no-inline-comments": "error", // Disallow comments on the same line as code

      "import/order": ["warn", {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index", "type", "object"],
        "pathGroups": [
          { "pattern": "@nestjs/**", "group": "external", "position": "before" },
          { "pattern": "@ui/app/**", "group": "internal", "position": "before" },
          { "pattern": "@ui/assets/**", "group": "internal", "position": "before" },
          { "pattern": "@ui/components/**", "group": "internal", "position": "before" },
          { "pattern": "@ui/config/**", "group": "internal", "position": "before" },
          { "pattern": "@ui/hooks/**", "group": "internal", "position": "before" },
          { "pattern": "@ui/lib/**", "group": "internal", "position": "before" },
          { "pattern": "@ui/services/**", "group": "internal", "position": "before" },
          { "pattern": "@ui/store/**", "group": "internal", "position": "before" },
          { "pattern": "@ui/styles/**", "group": "internal", "position": "before" },
          { "pattern": "@ui/types/**", "group": "internal", "position": "before" },
          { "pattern": "@ui/*", "group": "internal" },
          { "pattern": "@/core/**", "group": "internal", "position": "before" },
          { "pattern": "@/domain/**", "group": "internal", "position": "before" },
          { "pattern": "@/application/**", "group": "internal", "position": "before" },
          { "pattern": "@/infrastructure/**", "group": "internal", "position": "before" },
          { "pattern": "@/presentation/**", "group": "internal", "position": "before" },
          { "pattern": "@/shared/**", "group": "internal", "position": "after" },
          { "pattern": "@/refactored/**", "group": "internal", "position": "before" },
        ],
        "pathGroupsExcludedImportTypes": [],
        "newlines-between": "always",
        "alphabetize": { "order": "asc", "caseInsensitive": true }
      }],
      // "boundaries/element-types": [ "error", { // Temporarily commented out
      //     default: "allow",
      //     rules: [
      //       { from: ["domain"], disallow: ["application", "infrastructure", "presentation"], message: "DOMAIN: Proibido importar de ${dependency.type}." },
      //       { from: ["application"], allow: ["domain", "shared"], disallow: ["infrastructure", "presentation"], message: "APPLICATION: Proibido importar de ${dependency.type} (permitido: domain, shared)." },
      //       { from: ["infrastructure"], allow: ["domain", "application", "shared"], disallow: ["presentation"], message: "INFRA: Proibido importar de ${dependency.type} (permitido: domain, application, shared)." },
      //       { from: ["presentation"], allow: ["domain", "application", "shared", "ui-components", "ui-lib", "ui-hooks", "ui-features"], disallow: ["infrastructure"], message: "PRESENTATION: Proibido importar de ${dependency.type} (permitido: domain, application, shared, ui/*)." },
      //       { from: ["shared"], disallow: ["domain", "application", "infrastructure", "presentation", "ui-components", "ui-lib", "ui-hooks", "ui-features"], message: "SHARED: Proibido importar de camadas específicas (${dependency.type})." },
      //       { from: ["ui-components"], allow: ["ui-lib", "shared"], disallow: ["domain", "application", "infrastructure", "presentation", "ui-features"], message: "UI-COMPONENTS: Violação de dependência com ${dependency.type}." },
      //       { from: ["ui-features"], allow: ["ui-components", "ui-lib", "ui-hooks", "application", "domain", "shared"], disallow: ["infrastructure", "presentation"], message: "UI-FEATURES: Violação de dependência com ${dependency.type}." },
      //       { from: ["ui-lib"], allow: ["shared"], disallow: ["domain", "application", "infrastructure", "presentation", "ui-components", "ui-features", "ui-hooks"], message: "UI-LIB: Violação de dependência com ${dependency.type}." },
      //       { from: ["ui-hooks"], allow: ["ui-lib", "application", "domain", "shared"], disallow: ["infrastructure", "presentation", "ui-components", "ui-features"], message: "UI-HOOKS: Violação de dependência com ${dependency.type}." },
      //     ],
      //   },
      // ],
      "vitest/expect-expect": "warn",
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        }
      },
      // "boundaries/elements": [ // Temporarily commented out
      //   { type: "domain", pattern: "src_refactored/core/domain" },
      //   { type: "application", pattern: "src_refactored/core/application" },
      //   { type: "infrastructure", pattern: "src_refactored/infrastructure" },
      //   { type: "presentation", pattern: "src_refactored/presentation" },
      //   { type: "shared", pattern: "src_refactored/shared" },
      //   { type: "ui-components", pattern: "src_refactored/presentation/ui/components" },
      //   { type: "ui-features", pattern: "src_refactored/presentation/ui/app" },
      //   { type: "ui-lib", pattern: "src_refactored/presentation/ui/lib" },
      //   { type: "ui-hooks", pattern: "src_refactored/presentation/ui/hooks" },
      // ],
      // "boundaries/ignore": ["src_refactored/presentation/ui/routeTree.gen.ts"], // Temporarily commented out
      react: { // Add React version setting here
        version: "detect",
      },
    },
  },
  // Override for Application .tsx AND ALL Test files (.ts and .tsx) for line limits
  {
    files: [
      "src_refactored/**/*.tsx",
      "src_refactored/**/*.spec.ts",
      "src_refactored/**/*.test.ts",
      "src_refactored/**/*.spec.tsx",
      "src_refactored/**/*.test.tsx"
    ],
    ignores: [
      "src_refactored/presentation/ui/components/ui/**/*.tsx"
    ],
    rules: {
      "max-lines-per-function": ["error", { "max": 100, "skipBlankLines": true, "skipComments": true }],
      "max-lines": ["error", { "max": 200, "skipBlankLines": true, "skipComments": true }],
    }
  },
  // Config specific to test files for relaxing OTHER rules (e.g., max-statements)
  {
    files: [
      "src_refactored/**/*.spec.ts",
      "src_refactored/**/*.test.ts",
      "src_refactored/**/*.spec.tsx",
      "src_refactored/**/*.test.tsx"
    ],
    rules: {
      // Line limits are inherited from the block above (100/200).
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_", vars: "all", args: "after-used", ignoreRestSiblings: true }],
      "max-statements": "off",
      // Allow inline comments in test files if necessary for describe/it blocks or specific test explanations
      "no-inline-comments": "off",
      // Test files might use ts-expect-error more liberally for testing error conditions
      "@typescript-eslint/ban-ts-comment": ["error", {
        "ts-expect-error": "allow-with-description", // or "off" if too restrictive for tests
        "ts-ignore": true,
        "ts-nocheck": true,
        "ts-check": false,
        "minimumDescriptionLength": 3
      }],
    },
  },
  // Config block to specifically turn OFF rules for ShadCN UI components
  {
    files: ["src_refactored/presentation/ui/components/ui/**/*.tsx"],
    rules: {
      "@typescript-eslint/naming-convention": "off",
      "max-lines-per-function": "off",
      "max-lines": "off",
      "max-statements": "off",
      "no-inline-comments": "off", // Also allow inline comments in shadcn/ui
      "@typescript-eslint/ban-ts-comment": "off", // Turn off ts-comment bans for shadcn/ui
    }
  }
];
