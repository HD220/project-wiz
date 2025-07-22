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
  "react/react-in-jsx-scope": "error",
  "react-hooks/rules-of-hooks": "error",
  "react-hooks/exhaustive-deps": "error",
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
        { pattern: "@/main/**", group: "internal", position: "before" },
        { pattern: "@/renderer/**", group: "internal", position: "before" },
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
          type: "main",
          pattern: "src/main/**",
          allow: ["type", "interface", "enum"],
        },
        {
          type: "renderer",
          pattern: "src/renderer/**",
          allow: ["type", "interface", "enum"],
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
    { max: 100, skipBlankLines: true, skipComments: true },
  ],
  "max-statements": ["warn", { max: 20 }],
  "id-length": ["warn", { min: 2, exceptions: ["_"] }],
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
      "public/**",
      "src/**/routeTree.gen.ts",
      "src/**/locales/*.ts",
      "src/renderer/components/ui/**",
    ],
  },
  {
    files: ["src/**/*.ts", "src/**/*.tsx", "tests/**/*.ts", "tests/**/*.tsx"],
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
      ...importAndBoundaryRules,
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
        { type: "shared", pattern: "src/shared" },
        { type: "main", pattern: "src/main" },
        { type: "renderer", pattern: "src/renderer" },
      ],
      react: {
        version: "detect",
      },
    },
  },

  // 3. Consolidated Override for Application .tsx files
  {
    files: ["src/**/*.tsx"],
    ignores: ["**/*.test.tsx", "**/*.spec.tsx"],
    rules: {
      "max-lines-per-function": [
        "warn",
        { max: 150, skipBlankLines: true, skipComments: true },
      ],
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

  // 5. Override for preload.ts and window.d.ts - allow type imports from main
  {
    files: ["src/renderer/preload.ts", "src/renderer/window.d.ts"],
    rules: {
      "boundaries/element-types": "off",
    },
  },
];
