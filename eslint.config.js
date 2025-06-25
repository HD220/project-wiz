// @ts-check
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import vitestPlugin from "eslint-plugin-vitest";
import * as importPlugin from "eslint-plugin-import";
import boundariesPlugin from "eslint-plugin-boundaries"; // Importado aqui
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
      // Mantendo ignores para src original por enquanto
      "src/core/**",
      "src/domain/**",
      "src/electron/**",
      "src/examples/**",
      "src/infrastructure/**",
      "src/main.ts",
      "src/modules/**",
      "src/presentation/**",
      "src/shared/**",
      "scripts/**",
      ".vite/**",
    ],
  },
  // Configuração Global (para .ts e .tsx, exceto testes e específicos)
  {
    files: ["**/*.ts", "**/*.tsx"], // Aplicar a TS e TSX
    excludedFiles: ["**/*.spec.ts", "**/*.test.ts"], // Excluir arquivos de teste desta config global
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaFeatures: {
          jsx: true, // Habilitar JSX para .ts também, caso ocorra, embora mais comum em .tsx
        }
      },
      globals: {
        ...vitestPlugin.environments.env.globals,
        ...globals.node,
        ...globals.browser,
        window: "readonly",
        React: "readonly", // Adicionar React aos globais para TSX
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      import: importPlugin,
      vitest: vitestPlugin,
      boundaries: boundariesPlugin, // Adicionar plugin boundaries
    },
    rules: {
      // Regras JS e TS recomendadas
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,

      // Regras customizadas existentes
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
      "import/no-unresolved": "error", // Já configurado para usar resolver typescript
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/naming-convention": ["warn",
        { "selector": "default", "format": ["camelCase"], "leadingUnderscore": "allow", "trailingUnderscore": "allow" },
        { "selector": "variable", "format": ["camelCase", "PascalCase", "UPPER_CASE"], "leadingUnderscore": "allow", "trailingUnderscore": "allow" },
        { "selector": "function", "format": ["camelCase", "PascalCase"] },
        { "selector": "parameter", "format": ["camelCase"], "leadingUnderscore": "allow" },
        { "selector": "typeLike", "format": ["PascalCase"] },
        { "selector": "enumMember", "format": ["PascalCase", "UPPER_CASE"] }
      ],
      "max-depth": ["warn", { "max": 4 }], // Ajustado para 4 globalmente, pode ser mais restritivo por tipo de arquivo
      "no-else-return": "warn",
      "id-length": ["warn", { "min": 2, "exceptions": ["id", "db", "ui", "en", "pt", "i", "X", "Y", "Z", "x", "y", "z", "a", "b", "e", "fs", "vo", "to"] }], // min 2
      "max-lines-per-function": ["warn", { "max": 50, "skipBlankLines": true, "skipComments": true }], // Aumentado globalmente
      "max-statements": ["warn", { "max": 20 }], // Aumentado globalmente
      "max-lines": ["warn", { "max": 300, "skipBlankLines": true, "skipComments": true }], // Aumentado globalmente
      "import/order": ["warn", {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index", "type", "object"],
        "pathGroups": [
          { "pattern": "@nestjs/**", "group": "external", "position": "before" },
          { "pattern": "@/**", "group": "internal" }, // Grupo genérico para @/
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
        ],
        "pathGroupsExcludedImportTypes": [],
        "newlines-between": "always",
        "alphabetize": { "order": "asc", "caseInsensitive": true }
      }],

      // Regras Boundaries (aplicadas a todos os arquivos .ts, .tsx cobertos por esta config)
      "boundaries/element-types": [
        2, // error
        {
          default: "allow", // Por padrão, permitir importações se não houver regra específica
          rules: [
            { from: ["domain"], disallow: ["application", "infrastructure", "presentation"], message: "DOMAIN: Proibido importar de ${dependency.type}." },
            { from: ["application"], allow: ["domain", "shared"], disallow: ["infrastructure", "presentation"], message: "APPLICATION: Proibido importar de ${dependency.type} (permitido: domain, shared)." },
            { from: ["infrastructure"], allow: ["domain", "application", "shared"], disallow: ["presentation"], message: "INFRA: Proibido importar de ${dependency.type} (permitido: domain, application, shared)." },
            { from: ["presentation"], allow: ["domain", "application", "shared", "ui-components", "ui-lib", "ui-hooks", "ui-features"], disallow: ["infrastructure"], message: "PRESENTATION: Proibido importar de ${dependency.type} (permitido: domain, application, shared, ui/*)." },
            { from: ["shared"], disallow: ["domain", "application", "infrastructure", "presentation", "ui-components", "ui-lib", "ui-hooks", "ui-features"], message: "SHARED: Proibido importar de camadas específicas (${dependency.type})." },
            // Regras específicas para UI dentro de presentation
            { from: ["ui-components"], allow: ["ui-lib", "shared"], disallow: ["domain", "application", "infrastructure", "presentation", "ui-features"], message: "UI-COMPONENTS: Violação de dependência com ${dependency.type}." },
            { from: ["ui-features"], allow: ["ui-components", "ui-lib", "ui-hooks", "application", "domain", "shared"], disallow: ["infrastructure", "presentation"], message: "UI-FEATURES: Violação de dependência com ${dependency.type}." },
            { from: ["ui-lib"], allow: ["shared"], disallow: ["domain", "application", "infrastructure", "presentation", "ui-components", "ui-features", "ui-hooks"], message: "UI-LIB: Violação de dependência com ${dependency.type}." },
            { from: ["ui-hooks"], allow: ["ui-lib", "application", "domain", "shared"], disallow: ["infrastructure", "presentation", "ui-components", "ui-features"], message: "UI-HOOKS: Violação de dependência com ${dependency.type}." },
          ],
        },
      ],
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
      "boundaries/elements": [
        { type: "domain", pattern: "src_refactored/core/domain" }, // modo 'folder' é default
        { type: "application", pattern: "src_refactored/core/application" },
        { type: "infrastructure", pattern: "src_refactored/infrastructure" },
        { type: "presentation", pattern: "src_refactored/presentation" }, // Camada geral de apresentação
        { type: "shared", pattern: "src_refactored/shared" },
        // Tipos mais granulares para a UI dentro de presentation
        { type: "ui-components", pattern: "src_refactored/presentation/ui/components" },
        { type: "ui-features", pattern: "src_refactored/presentation/ui/app" }, // Diretório de rotas/features da UI
        { type: "ui-lib", pattern: "src_refactored/presentation/ui/lib" },
        { type: "ui-hooks", pattern: "src_refactored/presentation/ui/hooks" },
        // { type: "ui-styles", pattern: "src_refactored/presentation/ui/styles" }, // Geralmente não importado
        // { type: "ui-main", pattern: "src_refactored/presentation/ui/main.tsx", mode: "file" },
        // { type: "ui-app-comp", pattern: "src_refactored/presentation/ui/App.tsx", mode: "file" }
      ],
      "boundaries/ignore": ["src_refactored/presentation/ui/routeTree.gen.ts"], // Ignorar arquivo gerado
       "boundaries/alias": { // Para ajudar o plugin a resolver os aliases do tsconfig
        "@/": "./src_refactored/presentation/ui/", // Principal alias da UI
        "@/components/*": "./src_refactored/presentation/ui/components/*",
        "@/lib/*": "./src_refactored/presentation/ui/lib/*",
        "@/hooks/*": "./src_refactored/presentation/ui/hooks/*",
      }
    },
  },
  // Configuração específica para arquivos de teste
  {
    files: ["**/*.spec.ts", "**/*.test.ts", "**/*.spec.tsx", "**/*.test.tsx"],
    languageOptions: {
      globals: {
        ...globals.jest, // ou globals.vitest se for o caso
        jest: "readonly",
        vi: "readonly",
      },
    },
    plugins: {
      vitest: vitestPlugin,
    },
    rules: {
      ...vitestPlugin.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_", vars: "all", args: "after-used", ignoreRestSiblings: true }],
      "max-lines-per-function": "off", // Desabilitar para arquivos de teste
      "max-statements": "off", // Desabilitar para arquivos de teste
    },
  },
  // Override de max-lines para domain e application (exemplo, pode não ser necessário com o global aumentado)
  {
    files: ["src_refactored/core/domain/**/*.ts", "src_refactored/core/application/**/*.ts"],
    rules: {
      "max-lines-per-function": ["warn", { "max": 100, "skipBlankLines": true, "skipComments": true }], // Um pouco mais flexível
      "max-lines": ["warn", { "max": 500, "skipBlankLines": true, "skipComments": true }]
    }
  },
  {
    files: ["src_refactored/presentation/ui/**/*.tsx"], // Regras mais permissivas para componentes React complexos
    rules: {
        "max-lines-per-function": ["warn", { "max": 150, "skipBlankLines": true, "skipComments": true }],
        "max-lines": ["warn", { "max": 600, "skipBlankLines": true, "skipComments": true }],
        "max-statements": ["warn", { "max": 30 }]
    }
  }
];
