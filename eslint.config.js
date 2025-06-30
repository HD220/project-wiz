// @ts-check
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import vitestPlugin from "eslint-plugin-vitest";
import * as importPlugin from "eslint-plugin-import";
import boundariesPlugin from "eslint-plugin-boundaries";
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
      // Files outside src_refactored that might be picked up by broad patterns
      "*.config.js", // e.g. eslint.config.js itself, lingui.config.js
      "*.config.ts", // e.g. tailwind.config.ts, drizzle.config.ts
      "*.config.cts", // e.g. forge.config.cts
      "*.mts", // e.g. vitest.config.mts
      "index.html",
      "main.ts",
      "preload.ts",
      // Explicitly ignore top-level directories that are not src_refactored
      "docs/**",
      "migrations/**",
      "public/**",
      ".jules/**",
      ".roo/**",
      "types/**"
    ],
  },
  // Configuration for files within src_refactored
  {
    files: ["src_refactored/**/*.ts", "src_refactored/**/*.tsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname, // Ensures ESLint resolves tsconfig.json correctly
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...vitestPlugin.environments.env.globals, // For Vitest globals in test files
        ...globals.node,
        ...globals.browser,
        window: "readonly",
        React: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      import: importPlugin,
      vitest: vitestPlugin, // Keep for test files, won't harm non-test files
      boundaries: boundariesPlugin,
    },
    rules: {
      // Base recommended rules
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      ...vitestPlugin.configs.recommended.rules, // Apply test rules, will only affect test files due to context

      // Custom rules from the original config (applied globally now)
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
        // Added rule for objectLiteralProperty
        {
          "selector": "objectLiteralProperty",
          "format": ["camelCase", "PascalCase", "UPPER_CASE", "snake_case"],
          "leadingUnderscore": "allow",
          "trailingUnderscore": "allow"
        },
        // Added rule for static readonly class properties
        {
          "selector": "classProperty",
          "modifiers": ["static", "readonly"],
          "format": ["UPPER_CASE", "camelCase", "PascalCase"]
        }
      ],
      "max-depth": ["warn", { "max": 4 }],
      "no-else-return": "warn",
      "id-length": ["warn", { "min": 2, "exceptions": ["_"] }], // Added "_" to exceptions
      "max-lines-per-function": ["warn", { "max": 100, "skipBlankLines": true, "skipComments": true }], // Default increased
      "max-statements": ["warn", { "max": 25 }], // Default increased
      "max-lines": ["warn", { "max": 500, "skipBlankLines": true, "skipComments": true }], // Default increased
      "import/order": ["warn", {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index", "type", "object"],
        "pathGroups": [
          { "pattern": "@nestjs/**", "group": "external", "position": "before" },
          // Updated UI paths
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
          // Core paths remain the same
          { "pattern": "@/core/**", "group": "internal", "position": "before" },
          { "pattern": "@/domain/**", "group": "internal", "position": "before" },
          { "pattern": "@/application/**", "group": "internal", "position": "before" },
          { "pattern": "@/infrastructure/**", "group": "internal", "position": "before" },
          { "pattern": "@/presentation/**", "group": "internal", "position": "before" }, // General presentation
          { "pattern": "@/shared/**", "group": "internal", "position": "after" },
          { "pattern": "@/refactored/**", "group": "internal", "position": "before" },
        ],
        "pathGroupsExcludedImportTypes": [],
        "newlines-between": "always",
        "alphabetize": { "order": "asc", "caseInsensitive": true }
      }],
      "boundaries/element-types": [ "error", {
          default: "allow",
          rules: [
            { from: ["domain"], disallow: ["application", "infrastructure", "presentation"], message: "DOMAIN: Proibido importar de ${dependency.type}." },
            { from: ["application"], allow: ["domain", "shared"], disallow: ["infrastructure", "presentation"], message: "APPLICATION: Proibido importar de ${dependency.type} (permitido: domain, shared)." },
            { from: ["infrastructure"], allow: ["domain", "application", "shared"], disallow: ["presentation"], message: "INFRA: Proibido importar de ${dependency.type} (permitido: domain, application, shared)." },
            { from: ["presentation"], allow: ["domain", "application", "shared", "ui-components", "ui-lib", "ui-hooks", "ui-features"], disallow: ["infrastructure"], message: "PRESENTATION: Proibido importar de ${dependency.type} (permitido: domain, application, shared, ui/*)." },
            { from: ["shared"], disallow: ["domain", "application", "infrastructure", "presentation", "ui-components", "ui-lib", "ui-hooks", "ui-features"], message: "SHARED: Proibido importar de camadas específicas (${dependency.type})." },
            { from: ["ui-components"], allow: ["ui-lib", "shared"], disallow: ["domain", "application", "infrastructure", "presentation", "ui-features"], message: "UI-COMPONENTS: Violação de dependência com ${dependency.type}." },
            { from: ["ui-features"], allow: ["ui-components", "ui-lib", "ui-hooks", "application", "domain", "shared"], disallow: ["infrastructure", "presentation"], message: "UI-FEATURES: Violação de dependência com ${dependency.type}." },
            { from: ["ui-lib"], allow: ["shared"], disallow: ["domain", "application", "infrastructure", "presentation", "ui-components", "ui-features", "ui-hooks"], message: "UI-LIB: Violação de dependência com ${dependency.type}." },
            { from: ["ui-hooks"], allow: ["ui-lib", "application", "domain", "shared"], disallow: ["infrastructure", "presentation", "ui-components", "ui-features"], message: "UI-HOOKS: Violação de dependência com ${dependency.type}." },
          ],
        },
      ],
      // Specific overrides for test files (can be moved to a separate block if needed, but fine here for simplicity)
      "vitest/expect-expect": "warn", // Example: warn instead of error for expect-expect
      "@typescript-eslint/ban-ts-comment": ["error", {"ts-expect-error": "allow-with-description"}],

       // Turn off max lines/statements for test files (using a more specific glob pattern here)
      // This is a common pattern: have a global rule, then override for specific file types.
      // However, ESLint flat config processes arrays. A later object can override an earlier one if files match.
      // For simplicity, I'm keeping rules here, but for test-specific overrides, a separate block is cleaner.
      // For now, we rely on the fact that these rules are off in the dedicated test block below.
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true, // Rproperty of the typescript resolver
          project: "./tsconfig.json",
        },
        // Potentially add node resolver if you have issues with built-in modules, though typescript resolver should handle most cases.
        // node: {
        //   extensions: [".js", ".jsx", ".ts", ".tsx"]
        // }
      },
      "boundaries/elements": [
        // Relative to the "files" glob, which is "src_refactored/**"
        { type: "domain", pattern: "core/domain" },
        { type: "application", pattern: "core/application" },
        { type: "infrastructure", pattern: "infrastructure" },
        { type: "presentation", pattern: "presentation" },
        { type: "shared", pattern: "shared" },
        { type: "ui-components", pattern: "presentation/ui/components" },
        { type: "ui-features", pattern: "presentation/ui/app" }, // Assuming 'app' is where features reside
        { type: "ui-lib", pattern: "presentation/ui/lib" },
        { type: "ui-hooks", pattern: "presentation/ui/hooks" },
      ],
      "boundaries/ignore": ["presentation/ui/routeTree.gen.ts"], // Adjusted to be relative
    },
  },
  // Config specific to test files within src_refactored
  {
    files: ["src_refactored/**/*.spec.ts", "src_refactored/**/*.test.ts", "src_refactored/**/*.spec.tsx", "src_refactored/**/*.test.tsx"],
    // No need to repeat languageOptions if covered by the global one, unless overriding parser/globals
    rules: {
      // Disable or relax rules for test files
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_", vars: "all", args: "after-used", ignoreRestSiblings: true }],
      "max-lines-per-function": "off",
      "max-statements": "off",
       // Other test-specific rule adjustments can go here
    },
  },
];
