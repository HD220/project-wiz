// @ts-check
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import vitestPlugin from "eslint-plugin-vitest";
import * as importPlugin from "eslint-plugin-import";
import boundariesPlugin from "eslint-plugin-boundaries";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactPlugin from "eslint-plugin-react";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import globals from "globals";

// --- Thematic Rule Group Constants ---

const baseRecommendedRules = {
  ...js.configs.recommended.rules,
  ...tsPlugin.configs.recommended.rules,
  ...vitestPlugin.configs.recommended.rules,
  ...reactPlugin.configs.recommended.rules,
  ...jsxA11yPlugin.configs.recommended.rules,
};

const typeScriptSpecificRules = {
  "@typescript-eslint/no-unused-vars": [
    "warn",
    {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
      caughtErrorsIgnorePattern: "^_",
    },
  ],
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/naming-convention": [
    "warn",
    {
      selector: "default",
      format: ["camelCase"],
      leadingUnderscore: "allow",
      trailingUnderscore: "allow",
    },
    {
      selector: "import",
      format: ["camelCase", "PascalCase", "UPPER_CASE"],
      leadingUnderscore: "allow",
      trailingUnderscore: "allow",
    },
    {
      selector: "variable",
      format: ["camelCase", "PascalCase", "UPPER_CASE"],
      leadingUnderscore: "allow",
      trailingUnderscore: "allow",
    },
    { selector: "function", format: ["camelCase", "PascalCase"] },
    {
      selector: "parameter",
      format: ["camelCase"],
      leadingUnderscore: "allow",
    },
    { selector: "typeLike", format: ["PascalCase"] },
    { selector: "enumMember", format: ["PascalCase", "UPPER_CASE"] },
    // Added 'property' to allow snake_case for interface/type properties (e.g. for external APIs)
    {
      selector: ["objectLiteralProperty", "property"],
      format: ["camelCase", "PascalCase", "UPPER_CASE", "snake_case"],
      leadingUnderscore: "allow",
      trailingUnderscore: "allow",
    },
    {
      selector: "classProperty",
      modifiers: ["static", "readonly"],
      format: ["UPPER_CASE", "camelCase", "PascalCase"],
    },
  ],
  "@typescript-eslint/ban-ts-comment": [
    "error",
    {
      "ts-expect-error": "allow-with-description",
      "ts-ignore": true,
      "ts-nocheck": true,
      "ts-check": false,
      minimumDescriptionLength: 3,
    },
  ],
};

const reactSpecificRules = {
  "react/react-in-jsx-scope": "off",
  "react-hooks/rules-of-hooks": "error",
  "react-hooks/exhaustive-deps": "warn",
};

const importAndBoundaryRules = {
  "import/no-unresolved": "error",
  "import/order": [
    "warn",
    {
      groups: [
        "builtin",
        "external",
        "internal",
        "parent",
        "sibling",
        "index",
        "type",
        "object",
      ],
      pathGroups: [
        { pattern: "@ui/*", group: "internal" },
        { pattern: "@/core/**", group: "internal", position: "before" },
        { pattern: "@/domain/**", group: "internal", position: "before" },
        { pattern: "@/application/**", group: "internal", position: "before" },
        {
          pattern: "@/infrastructure/**",
          group: "internal",
          position: "before",
        },
        { pattern: "@/presentation/**", group: "internal", position: "before" },
        { pattern: "@/shared/**", group: "internal", position: "after" },
      ],
      pathGroupsExcludedImportTypes: [],
      "newlines-between": "always",
      alphabetize: { order: "asc", caseInsensitive: true },
    },
  ],
  "boundaries/element-types": [
    "error",
    {
      default: "allow",
      rules: [
        {
          from: ["domain"],
          allow: ["shared", "zod-lib"],
          disallow: ["application", "infrastructure", "presentation"],
          message:
            "DOMAIN: Proibido importar de ${dependency.type} (permitido: shared, zod-lib).",
        },
        {
          from: ["application"],
          allow: ["domain", "shared"],
          disallow: ["infrastructure", "presentation"],
          message:
            "APPLICATION: Proibido importar de ${dependency.type} (permitido: domain, shared).",
        },
        {
          from: ["infrastructure"],
          allow: ["domain", "application", "shared"],
          disallow: ["presentation"],
          message:
            "INFRA: Proibido importar de ${dependency.type} (permitido: domain, application, shared).",
        },
        {
          from: ["presentation"],
          allow: [
            "domain",
            "application",
            "infrastructure",
            "shared",
          ],
          disallow: [
            "ui-components",
            "ui-lib",
            "ui-hooks",
            "ui-features",
          ],
          message:
            "PRESENTATION: Proibido importar de ${dependency.type} (permitido: domain, application, infrastructure, shared, mas não de UI).",
        },
        {
          from: ["shared"],
          allow: ["application", "infrastructure"],
          disallow: [
            "domain",
            "presentation",
            "ui-components",
            "ui-lib",
            "ui-hooks",
            "ui-features",
          ],
          message:
            "SHARED: Proibido importar de camadas específicas (${dependency.type}).",
        },
        {
          from: ["ui-components"],
          allow: ["ui-lib", "shared"],
          disallow: [
            "domain",
            "application",
            "infrastructure",
            "presentation",
            "ui-features",
          ],
          message:
            "UI-COMPONENTS: Violação de dependência com ${dependency.type}.",
        },
        {
          from: ["ui-features"],
          allow: [
            "ui-components",
            "ui-lib",
            "ui-hooks",
            "application",
            "domain",
            "shared",
          ],
          disallow: ["infrastructure", "presentation"],
          message:
            "UI-FEATURES: Violação de dependência com ${dependency.type}.",
        },
        {
          from: ["ui-lib"],
          allow: ["shared"],
          disallow: [
            "domain",
            "application",
            "infrastructure",
            "presentation",
            "ui-components",
            "ui-features",
            "ui-hooks",
          ],
          message: "UI-LIB: Violação de dependência com ${dependency.type}.",
        },
        {
          from: ["ui-hooks"],
          allow: ["ui-lib", "application", "domain", "shared"],
          disallow: [
            "infrastructure",
            "presentation",
            "ui-components",
            "ui-features",
          ],
          message: "UI-HOOKS: Violação de dependência com ${dependency.type}.",
        },
      ],
    },
  ],
};

const codeStyleAndQualityRules = {
  "max-depth": ["warn", { max: 4 }],
  "no-else-return": "warn",
  "id-length": ["warn", { min: 2, exceptions: ["_", "a", "b"] }], // Added 'a' for ReactMarkdown components, 'b' as common generic
  "max-statements": ["warn", { max: 35 }], // Updated from 25
  "max-lines-per-function": [
    "error",
    { max: 70, skipBlankLines: true, skipComments: true },
  ], // Updated from 50
  "max-lines": [
    "error",
    { max: 200, skipBlankLines: true, skipComments: true },
  ],
  "no-inline-comments": "error",
};

const testingSpecificRules = {
  "vitest/expect-expect": "warn",
};

// --- Main ESLint Configuration Array ---
export default [
  // 1. Global Ignores
  {
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
      "types/**",
    ],
  },
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
        NodeJS: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      import: importPlugin,
      vitest: vitestPlugin,
      boundaries: boundariesPlugin,
      "react-hooks": reactHooksPlugin,
      react: reactPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    rules: {
      ...baseRecommendedRules,
      ...typeScriptSpecificRules,
      ...reactSpecificRules,
      ...importAndBoundaryRules,
      ...codeStyleAndQualityRules,
      ...testingSpecificRules,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
      "boundaries/elements": [
        { type: "domain", pattern: "src_refactored/core/domain" },
        { type: "application", pattern: "src_refactored/core/application" },
        { type: "infrastructure", pattern: "src_refactored/infrastructure" },
        { type: "presentation", pattern: "src_refactored/presentation" },
        { type: "shared", pattern: "src_refactored/shared" },
        { type: "zod-lib", pattern: "zod" }, // Added for Zod
        {
          type: "ui-components",
          pattern: "src_refactored/presentation/ui/components",
        },
        { type: "ui-features", pattern: "src_refactored/presentation/ui/app" },
        { type: "ui-lib", pattern: "src_refactored/presentation/ui/lib" },
        { type: "ui-hooks", pattern: "src_refactored/presentation/ui/hooks" },
      ],
      "boundaries/ignore": ["src_refactored/presentation/ui/routeTree.gen.ts"],
      react: {
        version: "detect",
      },
    },
  },

  // 3. Override for Application .tsx AND ALL Test files for line limits
  //    (Excluding ShadCN UI components)
  {
    files: [
      "src_refactored/**/*.tsx",
      "src_refactored/**/*.spec.ts",
      "src_refactored/**/*.test.ts",
      "src_refactored/**/*.spec.tsx",
      "src_refactored/**/*.test.tsx",
    ],
    ignores: ["src_refactored/presentation/ui/components/ui/**/*.tsx"],
    rules: {
      // Relaxed line limits for .tsx and test files
      "max-lines-per-function": [
        "error",
        { max: 100, skipBlankLines: true, skipComments: true },
      ],
    },
  },

  // 4. Override for Test files (relaxing other specific rules)
  {
    files: [
      "src_refactored/**/*.spec.ts",
      "src_refactored/**/*.test.ts",
      "src_refactored/**/*.spec.tsx",
      "src_refactored/**/*.test.tsx",
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
        },
      ],
      "max-statements": "off",
      "no-inline-comments": "off", // Allow inline comments in test files
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-expect-error": "allow-with-description", // More lenient for testing error conditions
          "ts-ignore": true,
          "ts-nocheck": true,
          "ts-check": false,
          minimumDescriptionLength: 3,
        },
      ],
    },
  },

  // 5. Override for ShadCN UI components
  {
    files: [
      "src_refactored/presentation/ui/components/ui/**/*.tsx",
      "src_refactored/**/*.gen.ts",
      "src_refactored/**/locales/*.ts",
    ],
    rules: {
      "@typescript-eslint/naming-convention": "off",
      "max-lines-per-function": "off",
      "max-lines": "off",
      "max-statements": "off",
      "no-inline-comments": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "react/prop-types": "off",
    },
  },
];
