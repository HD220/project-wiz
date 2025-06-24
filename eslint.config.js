// @ts-check
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import vitestPlugin from "eslint-plugin-vitest";
import * as importPlugin from "eslint-plugin-import";
import globals from "globals";

export default [
  {
    ignores: [
      "**/_old/**",
      "**/coverage/**",
      "**/dist/**",
      "**/node_modules/**",
      "tests/test-setup.d.ts",
      "**/k6/**",
      "**/jslib.k6.io/**",
      "backup/**",
      "src2/**",
      "src/core/**",
      "src/domain/**",
      "src/electron/**",
      "src/examples/**",
      "src/infrastructure/**",
      "src/main.ts",
      "src/modules/**",
      "src/presentation/**",
      "src/shared/**",
      "scripts/**", // Added from .eslintignore
      ".vite/**", // Added from .eslintignore
    ],
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
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
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
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
      "import/order": ["warn", {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index", "type", "object"],
        "pathGroups": [
          { "pattern": "@nestjs/**", "group": "external", "position": "before" },
          { "pattern": "@/refactored/**", "group": "internal", "position": "before" },
          { "pattern": "@/application/**", "group": "internal", "position": "before" },
          { "pattern": "@/core/**", "group": "internal", "position": "before" },
          { "pattern": "@/domain/**", "group": "internal", "position": "before" },
          { "pattern": "@/infrastructure/**", "group": "internal", "position": "before" },
          { "pattern": "@/presentation/**", "group": "internal", "position": "before" },
          { "pattern": "@/components/**", "group": "internal", "position": "before" },
          { "pattern": "@/lib/**", "group": "internal", "position": "before" },
          { "pattern": "@/hooks/**", "group": "internal", "position": "before" },
          { "pattern": "@/ui/**", "group": "internal", "position": "before" },
          { "pattern": "@/shared/**", "group": "internal", "position": "after" },
          { "pattern": "@/*", "group": "internal", "position": "after" }
        ],
        "pathGroupsExcludedImportTypes": [],
        "newlines-between": "always",
        "alphabetize": { "order": "asc", "caseInsensitive": true }
      }],
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
    },
  },
  {
    files: ["**/*.tsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        React: "readonly",
        window: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      import: importPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
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
      "import/order": ["warn", {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index", "type", "object"],
        "pathGroups": [
          { "pattern": "@nestjs/**", "group": "external", "position": "before" },
          { "pattern": "@/refactored/**", "group": "internal", "position": "before" },
          { "pattern": "@/application/**", "group": "internal", "position": "before" },
          { "pattern": "@/core/**", "group": "internal", "position": "before" },
          { "pattern": "@/domain/**", "group": "internal", "position": "before" },
          { "pattern": "@/infrastructure/**", "group": "internal", "position": "before" },
          { "pattern": "@/presentation/**", "group": "internal", "position": "before" },
          { "pattern": "@/components/**", "group": "internal", "position": "before" },
          { "pattern": "@/lib/**", "group": "internal", "position": "before" },
          { "pattern": "@/hooks/**", "group": "internal", "position": "before" },
          { "pattern": "@/ui/**", "group": "internal", "position": "before" },
          { "pattern": "@/shared/**", "group": "internal", "position": "after" },
          { "pattern": "@/*", "group": "internal", "position": "after" }
        ],
        "pathGroupsExcludedImportTypes": [],
        "newlines-between": "always",
        "alphabetize": { "order": "asc", "caseInsensitive": true }
      }],
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
    },
  },
  {
    files: ["**/*.spec.ts", "**/*.test.ts"],
    languageOptions: {
      globals: {
        ...globals.jest,
        jest: "readonly",
        vi: "readonly",
      },
    },
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
    },
  },
];
