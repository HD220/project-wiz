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
      "tests/**", // Ignoring all tests outside src_refactored for now
      "**/k6/**",
      "**/jslib.k6.io/**",
      "backup/**",
      "src/**",
      "src2/**",
      "scripts/**",
      ".vite/**",
    ],
  },
  // Single, comprehensive configuration for all TypeScript files (.ts, .tsx)
  {
    files: ["**/*.ts", "**/*.tsx"], // This will include drizzle.config.ts, tailwind.config.ts etc.
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json", // Ensure this tsconfig includes all files ESLint will see
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
        { "selector": "variable", "format": ["camelCase", "PascalCase", "UPPER_CASE"], "leadingUnderscore": "allow", "trailingUnderscore": "allow" },
        { "selector": "function", "format": ["camelCase", "PascalCase"] },
        { "selector": "parameter", "format": ["camelCase"], "leadingUnderscore": "allow" },
        { "selector": "typeLike", "format": ["PascalCase"] },
        { "selector": "enumMember", "format": ["PascalCase", "UPPER_CASE"] }
      ],
      "max-depth": ["warn", { "max": 4 }],
      "no-else-return": "warn",
      "id-length": ["warn", { "min": 2, "exceptions": ["id", "db", "ui", "en", "pt", "i", "X", "Y", "Z", "x", "y", "z", "a", "b", "e", "fs", "vo", "to"] }],
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
          alwaysTryTypes: true,
          project: "./tsconfig.json",
          extensions: [".ts", ".tsx", ".js", ".jsx", ".json"], // Explicitly added extensions
        }
        // The alias map below is commented out to rely solely on eslint-import-resolver-typescript
        /*
        alias: {
          map: [
            ["@", "./src_refactored/presentation/ui"],
            ["@/app", "./src_refactored/presentation/ui/app"],
            ["@/assets", "./src_refactored/presentation/ui/assets"],
            ["@/components", "./src_refactored/presentation/ui/components"],
            ["@/config", "./src_refactored/presentation/ui/config"],
            ["@/hooks", "./src_refactored/presentation/ui/hooks"],
            ["@/lib", "./src_refactored/presentation/ui/lib"],
            ["@/services", "./src_refactored/presentation/ui/services"],
            ["@/store", "./src_refactored/presentation/ui/store"],
            ["@/styles", "./src_refactored/presentation/ui/styles"],
            ["@/types", "./src_refactored/presentation/ui/types"],
            ["@/application", "./src_refactored/core/application"],
            ["@/core", "./src_refactored/core"],
            ["@/domain", "./src_refactored/core/domain"],
            ["@/infrastructure", "./src_refactored/infrastructure"],
            ["@/presentation", "./src_refactored/presentation"],
            ["@/shared", "./src_refactored/shared"],
            ["@/refactored", "./src_refactored"]
          ],
          extensions: [".ts", ".tsx", ".js", ".jsx", ".json"]
        }
        */
      },
      "boundaries/elements": [
        { type: "domain", pattern: "src_refactored/core/domain" },
        { type: "application", pattern: "src_refactored/core/application" },
        { type: "infrastructure", pattern: "src_refactored/infrastructure" },
        { type: "presentation", pattern: "src_refactored/presentation" },
        { type: "shared", pattern: "src_refactored/shared" },
        { type: "ui-components", pattern: "src_refactored/presentation/ui/components" },
        { type: "ui-features", pattern: "src_refactored/presentation/ui/app" },
        { type: "ui-lib", pattern: "src_refactored/presentation/ui/lib" },
        { type: "ui-hooks", pattern: "src_refactored/presentation/ui/hooks" },
      ],
      "boundaries/ignore": ["src_refactored/presentation/ui/routeTree.gen.ts"],
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
