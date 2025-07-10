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
import eslintPluginPrettier from "eslint-plugin-prettier";
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
      selector: "typeProperty",
      filter: {
        regex: "^[a-z]+(?:-[a-z]+)*:[a-z]+(?:-[a-z]+)*$",
        match: true,
      },
      format: null,
    },
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
      selector: ["objectLiteralProperty", "property", "typeProperty"],
      format: ["camelCase", "PascalCase", "UPPER_CASE", "snake_case"],
      leadingUnderscore: "allow",
      trailingUnderscore: "allow",
    },
    {
      selector: "property",
      format: null,
      custom: {
        regex: "^[a-z]+(?:-[a-z]+)*:[a-z]+(?:-[a-z]+)*$",
        match: true,
      },
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
          allow: ["domain", "application", "infrastructure", "shared"],
          disallow: ["ui-components", "ui-lib", "ui-hooks", "ui-features"],
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
        {
          from: ["renderer"],
          allow: ["shared"],
          disallow: ["main"],
          message:
            "RENDERER: Proibido importar de ${dependency.type}. A comunicação deve ser via IPC.",
        },
        {
          from: ["main"],
          allow: ["shared"],
          disallow: ["renderer"],
          message:
            "MAIN: Proibido importar de ${dependency.type}. A comunicação deve ser via IPC.",
        },
      ],
    },
  ],
};

const codeStyleAndQualityRules = {
  "max-depth": ["warn", { max: 4 }],
  "no-else-return": "warn",
  "max-lines": ["warn", { max: 350, skipBlankLines: true, skipComments: true }],
  "max-lines-per-function": [
    "warn",
    { max: 70, skipBlankLines: true, skipComments: true },
  ],
  "max-statements": ["warn", { max: 15 }],
  "id-length": [
    "warn",
    { min: 2, exceptions: ["i", "j", "k", "x", "y", "z", "a", "b", "_"] },
  ],
};

const testingSpecificRules = {
  "vitest/expect-expect": "warn",
};

// --- Main ESLint Configuration Array ---
export default [
  // 1. Global Ignores
  {
    ignores: [
      "**/coverage/**",
      "**/dist/**",
      "**/node_modules/**",
      "**/k6/**",
      "**/jslib.k6.io/**",
      ".vite/**",
      "*.config.js",
      "*.config.ts",
      "*.config.cts",
      "*.mts",
      "index.html",
      "docs/**",
      "migrations/**",
      "public/**",
      "src/main/core/**",
    ],
  },
  {
    files: ["src/**/*.ts", "src/**/*.tsx", "tests/**/*.ts", "tests/**/*.tsx"],
    ignores: ["src/renderer/components/ui/**/*.tsx"],
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
        React: "readonly", // Added React to globals
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
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...baseRecommendedRules,
      ...typeScriptSpecificRules,
      ...reactSpecificRules,
      ...codeStyleAndQualityRules,
      ...testingSpecificRules,
      "prettier/prettier": "error",
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
      "boundaries/elements": [
        { type: "domain", pattern: "src/main/core/domain" },
        { type: "application", pattern: "src/main/core/application" },
        { type: "infrastructure", pattern: "src/main/infrastructure" },
        { type: "presentation", pattern: "src/main/presentation" },
        { type: "shared", pattern: "src/shared" },
        { type: "zod-lib", pattern: "zod" }, // Added for Zod
        {
          type: "ui-components",
          pattern: "src/renderer/components/ui",
        },
        { type: "ui-features", pattern: "src/renderer/features" },
        { type: "ui-lib", pattern: "src/renderer/lib" },
        {
          type: "ui-hooks",
          pattern: "src/renderer/hooks",
        },
        { type: "main", pattern: "src/main" },
        { type: "renderer", pattern: "src/renderer" },
      ],
      "boundaries/ignore": ["src/renderer/routeTree.gen.ts"],
      react: {
        version: "detect",
      },
    },
  },

  // 3. Consolidated Override for Application .tsx files
  {
    files: ["src/**/*.tsx"],
    ignores: [
      "src/renderer/components/ui/**/*.tsx",
      "**/*.test.tsx",
      "**/*.spec.tsx",
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

  // 4. Override for Test files
  {
    files: ["**/*.test.ts", "**/*.spec.ts", "**/*.test.tsx", "**/*.spec.tsx"],
    rules: {
      "max-lines-per-function": [
        "warn",
        { max: 120, skipBlankLines: true, skipComments: true },
      ],
      "max-statements": "off",
    },
  },

  // 5. Override for ShadCN UI components
  {
    files: [
      "src/renderer/components/ui/**/*.tsx",
      "src/**/*.gen.ts",
      "src/**/locales/*.ts",
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/naming-convention": "off",
      "max-lines-per-function": "off",
      "max-lines": "off",
      "max-statements": "off",
      "no-inline-comments": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "react/prop-types": "off",
      "no-undef": "off", // Allow React to be undefined in Shadcn UI components
    },
  },

  // 6. Override for specific files to allow single-character identifiers
  {
    files: [
      "src/main/kernel/kernel.test.ts",
      "src/renderer/features/direct-messages/components/ChatWindow.tsx",
      "src/renderer/features/persona-creation-wizard/components/step1.tsx",
      "src/renderer/features/persona-creation-wizard/components/step2.tsx",
      "src/renderer/features/persona-creation-wizard/index.tsx",
      "src/renderer/features/project-management/components/CreateProjectModal.tsx",
      "src/shared/common/base.entity.ts",
    ],
    rules: {
      "id-length": "off",
    },
  },
];
