# Guia de Ferramentas de Desenvolvimento e Qualidade de Código

## 1. Introdução

Este documento serve como um guia para configurar e utilizar as ferramentas de desenvolvimento adotadas no Project Wiz para garantir a qualidade, consistência e manutenibilidade do código. Ele detalha a configuração de linters, formatadores e verificações de pré-commit, complementando as diretrizes definidas em `docs/developer/coding-standards.md` e nas ADRs relevantes.

O objetivo é que todos os desenvolvedores (humanos e Agentes de IA) configurem seus ambientes de forma similar para uma experiência de desenvolvimento coesa e para que os padrões de código sejam aplicados automaticamente sempre que possível.

## 2. Configuração do Editor (Exemplo com VS Code)

Recomendamos o uso do Visual Studio Code (VS Code) devido à sua popularidade e excelente suporte para TypeScript, ESLint e Prettier.

### 2.1. Extensões Recomendadas

Instale as seguintes extensões no VS Code para uma melhor experiência de desenvolvimento e conformidade com os padrões:

*   **`dbaeumer.vscode-eslint` (ESLint):** Integra o ESLint diretamente no editor, mostrando erros e warnings em tempo real e permitindo correções automáticas.
*   **`esbenp.prettier-vscode` (Prettier - Code formatter):** Integra o Prettier para formatação automática de código.
*   **`EditorConfig.EditorConfig` (EditorConfig for VS Code):** Ajuda a manter convenções de codificação consistentes (indentação, fim de linha, etc.) entre diferentes editores e IDEs, lendo o arquivo `.editorconfig`.
*   **`bradlc.vscode-tailwindcss` (Tailwind CSS IntelliSense):** Fornece autocompletar, linting e preview para classes utilitárias do Tailwind CSS.
*   **`VisualStudioExptTeam.vscodeintellicode` (IntelliCode):** Fornece sugestões de código baseadas em IA, pode melhorar a produtividade.
*   **`bierner.markdown-mermaid` (Mermaid Markdown Syntax Highlighting & Preview):** Para visualizar diagramas Mermaid em arquivos Markdown (como esta documentação).

### 2.2. Configurações do Editor (`settings.json`)

Adicione ou atualize as seguintes configurações ao seu arquivo `settings.json` do VS Code (Ctrl+Shift+P ou Cmd+Shift+P, procure por "Open User Settings (JSON)") para habilitar a formatação ao salvar e outras integrações:

```json
{
  // Geral
  "editor.tabSize": 2,
  "files.eol": "\n", // Forçar LF para consistência entre OS
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true,

  // ESLint
  "eslint.enable": true,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "markdown" // Se desejar linting em blocos de código Markdown
  ],
  "eslint.options": {
    "overrideConfigFile": "./eslint.config.js" // Garante que está usando a config flat
  },
  "eslint.workingDirectories": [{ "mode": "auto" }], // Importante para monorepos ou projetos com múltiplas configs ESLint

  // Prettier (usado como formatador padrão)
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "prettier.configPath": ".prettierrc.js", // Aponta para o arquivo de configuração do Prettier
  "prettier.ignorePath": ".prettierignore", // Aponta para o arquivo .prettierignore

  // Formatação ao Salvar (Format On Save)
  "editor.formatOnSave": true,
  // Formatar apenas com Prettier (ESLint cuidará de outras correções via `codeActionsOnSave`)
  // "editor.codeActionsOnSave": {
  //   "source.fixAll.eslint": "explicit" // Ou 'explicit' se preferir acionar manualmente
  // },

  // Para garantir que o ESLint também possa formatar/corrigir ao salvar (se configurado para isso)
  // e para evitar conflitos com o formatador Prettier.
  // A configuração abaixo faz com que o ESLint seja executado após o Prettier.
  // No entanto, com `eslint-config-prettier`, o ESLint não deve aplicar regras de formatação.
  "editor.codeActionsOnSave": {
    "source.fixAll": "explicit", // Aplica correções de todos os providers, incluindo ESLint
    "source.organizeImports": "explicit" // Organiza imports ao salvar (se o plugin ESLint/TS estiver configurado)
  },

  // Configurações específicas de linguagem (se necessário)
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true,
    "files.trimTrailingWhitespace": false // Útil para Markdown
  },

  // Tailwind CSS IntelliSense
  "tailwindCSS.lint.invalidScreen": "error",
  "tailwindCSS.lint.invalidVariant": "error",
  "tailwindCSS.lint.invalidTailwindDirective": "error",
  "tailwindCSS.lint.recommendedVariantOrder": "warning"
}
```
**Nota:** A configuração `editor.codeActionsOnSave` pode ser ajustada. Se `eslint-plugin-prettier` for usado no ESLint, a formatação pode ser delegada ao ESLint. A configuração acima prioriza Prettier como formatador e ESLint para outras correções.

## 3. ESLint (`eslint.config.js`)

ESLint é usado para análise estática de código, identificando padrões problemáticos e impondo regras de estilo e qualidade. O Project Wiz utiliza o formato "Flat Config" (`eslint.config.js`).

*   **Fonte da Verdade:** O arquivo `eslint.config.js` na raiz do projeto é a fonte única de verdade para todas as regras de linting.
*   **Integração com Prettier:** `eslint-config-prettier` é usado para desabilitar regras de estilo do ESLint que conflitam com o Prettier, permitindo que o Prettier gerencie exclusivamente a formatação.
*   **Parser TypeScript:** `@typescript-eslint/parser` é usado para permitir que o ESLint entenda o código TypeScript.
*   **`parserOptions.project`:** É crucial configurar `parserOptions: { project: './tsconfig.json', tsconfigRootDir: import.meta.dirname }` para regras do `@typescript-eslint` que requerem informações de tipo.

### Exemplo Conceitual de `eslint.config.js` (Estrutura)

```javascript
// eslint.config.js (Exemplo Conceitual - NÃO COPIAR DIRETAMENTE, adaptar ao projeto)
import globals from 'globals';
import tseslint from 'typescript-eslint';
// import eslintPluginTypeScript from '@typescript-eslint/eslint-plugin'; // (tseslint.plugin já é isso)
// import eslintParserTypeScript from '@typescript-eslint/parser'; // (tseslint.parser já é isso)
import eslintPluginImport from 'eslint-plugin-import';
// import eslintPluginReact from 'eslint-plugin-react'; // Para JS puro, se necessário
// import eslintPluginReactRecommended from 'eslint-plugin-react/configs/recommended.js';
// import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y';
// import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
// import eslintPluginSonarJS from 'eslint-plugin-sonarjs';
// import eslintPluginSecurity from 'eslint-plugin-security'; // Ou eslint-plugin-security-node
// import eslintPluginTailwindCSS from 'eslint-plugin-tailwindcss';
// import eslintPluginFilenamesSimple from 'eslint-plugin-filenames-simple';
// import eslintPluginUnicorn from 'eslint-plugin-unicorn'; // Para filename-case, entre outras regras

import eslintConfigPrettier from 'eslint-config-prettier'; // DESABILITA regras de estilo do ESLint

export default tseslint.config(
  // Configurações Globais de Ignorar Arquivos
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.config.js', // Ignora si mesmo e outros arquivos de config JS na raiz
      '*.config.ts', // Ignora arquivos de config TS na raiz (como tailwind.config.ts)
      '*.config.mts',
      'docs/reference/adrs/**', // Ignora ADRs que podem ter snippets de código não conformes
      '.vite/', // Diretório do Vite
      // Adicionar outros diretórios ou arquivos gerados ou de bibliotecas aqui
    ],
  },

  // Configuração Base (Aplicável a todos os arquivos .js, .jsx, .ts, .tsx)
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error', // Reporta diretivas eslint-disable não utilizadas
    },
    languageOptions: {
      ecmaVersion: 'latest', // Usar a versão mais recente do ECMAScript
      sourceType: 'module',  // Usar módulos ES
      globals: {
        ...globals.browser, // Globais de ambiente de navegador
        ...globals.node,    // Globais de ambiente Node.js
        // Adicionar outras globais específicas do projeto se necessário
      },
    },
    // plugins: { // Plugins aplicáveis globalmente, se houver
    //   import: eslintPluginImport,
    // },
    // rules: { // Regras aplicáveis globalmente
    //   'import/order': ['warn', { /* ...config... */ }],
    // },
  },

  // Configurações Específicas para Arquivos TypeScript
  {
    files: ['**/*.{ts,tsx}'], // Aplica apenas a arquivos .ts e .tsx
    languageOptions: {
      parser: tseslint.parser, // Especifica o parser TypeScript para ESLint
      parserOptions: {
        project: './tsconfig.json', // Caminho para o tsconfig.json principal
        tsconfigRootDir: import.meta.dirname, // Raiz para o tsconfig.json
        ecmaFeatures: { jsx: true }, // Habilita parsing de JSX
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin, // Plugin TypeScript ESLint
      // 'react': eslintPluginReact, // Se estiver usando React
      // 'react-hooks': eslintPluginReactHooks,
      // 'jsx-a11y': eslintPluginJsxA11y,
      // 'sonarjs': eslintPluginSonarJS,
      // 'security': eslintPluginSecurity,
      // 'tailwindcss': eslintPluginTailwindCSS,
      // 'filenames-simple': eslintPluginFilenamesSimple,
      // 'unicorn': eslintPluginUnicorn,
    },
    rules: {
      // Regras Recomendadas (exemplos, ajustar conforme necessidade)
      // ...tseslint.configs.recommended.rules,
      // ...tseslint.configs.strict.rules, // Ou 'strict' para regras mais rigorosas
      // ...eslintPluginReactRecommended.rules, // Se usando React
      // ...eslintPluginJsxA11y.configs.recommended.rules,
      // ...eslintPluginSonarJS.configs.recommended.rules,
      // ...eslintPluginTailwindCSS.configs.recommended.rules,

      // Regras Customizadas ou Sobrescritas
      '@typescript-eslint/no-explicit-any': 'warn', // Alertar sobre 'any'
      '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }], // Permitir console.warn/error/info

      // Regras de Object Calisthenics (Exemplos)
      'max-depth': ['warn', { max: 3 }], // Limita aninhamento de blocos
      'no-else-return': 'warn',          // Desencoraja 'else' após 'return'
      'complexity': ['warn', 10],        // Limita complexidade ciclomática

      // Regras de Nomenclatura de Arquivos (Exemplo)
      // 'filenames-simple/filename-case': ['error', { 'case': 'kebab-case', 'ignore': ['^App\\.tsx$'] }],
      // 'unicorn/filename-case': ['error', {
      //   case: 'kebabCase',
      //   ignore: [/^README\.md$/, /^\$.*\.tsx$/, /^\[.*\].*\.tsx$/, /^page\.tsx$/, /^_layout\.tsx$/]
      // }],

      // Outras regras importantes
      // 'react-hooks/rules-of-hooks': 'error',
      // 'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Configuração do Prettier (DEVE SER A ÚLTIMA)
  // eslintConfigPrettier, // Desabilita todas as regras de estilo do ESLint que conflitam com Prettier
);
```

## 4. Prettier (`.prettierrc.js`)

Prettier é usado para formatação automática de código.

*   **Arquivo de Configuração:** `.prettierrc.js` na raiz do projeto.
*   **Exemplo de Conteúdo:**
    ```javascript
    // .prettierrc.js
    module.exports = {
      semi: true,                // Adicionar ponto e vírgula no final das linhas
      singleQuote: true,         // Usar aspas simples em vez de duplas
      tabWidth: 2,               // Largura da tabulação em espaços
      printWidth: 100,           // Largura máxima da linha antes de quebrar (ajustar conforme preferência)
      trailingComma: 'es5',      // Adicionar vírgula no final de objetos e arrays multi-linha (compatível com ES5)
      arrowParens: 'always',     // Sempre adicionar parênteses em arrow functions com um parâmetro (e.g., (x) => x)
      bracketSpacing: true,      // Adicionar espaços entre chaves em literais de objeto: { foo: bar }
      jsxSingleQuote: false,     // Usar aspas duplas em JSX para atributos
      endOfLine: 'lf',           // Forçar line endings para LF (Linux/macOS)
      // Para Tailwind: se prettier-plugin-tailwindcss não for detectado automaticamente
      // plugins: [require('prettier-plugin-tailwindcss')], // Descomentar se necessário
    };
    ```

## 5. EditorConfig (`.editorconfig`)

EditorConfig ajuda a manter estilos de codificação consistentes para múltiplos desenvolvedores trabalhando no mesmo projeto em vários editores e IDEs.

*   **Arquivo de Configuração:** `.editorconfig` na raiz do projeto.
*   **Exemplo de Conteúdo:**
    ```ini
    # EditorConfig is awesome: https://EditorConfig.org

    # Top-most EditorConfig file
    root = true

    [*]
    indent_style = space
    indent_size = 2
    end_of_line = lf
    charset = utf-8
    trim_trailing_whitespace = true
    insert_final_newline = true

    [*.md]
    trim_trailing_whitespace = false
    ```

## 6. Husky & `lint-staged`

Para garantir que os padrões de código sejam verificados antes dos commits.

*   **Husky:** Ferramenta para facilitar o uso de Git hooks (e.g., pre-commit, pre-push).
    *   **Setup:** `npx husky init` (cria `.husky/`) e então adicionar hooks, e.g., `npx husky add .husky/pre-commit "npx lint-staged"`.
*   **`lint-staged`:** Ferramenta para rodar linters/formatadores em arquivos que estão no "stage" do Git.
    *   **Configuração (Exemplo para `.lintstagedrc.js` ou `package.json`):**
        ```javascript
        // .lintstagedrc.js
        module.exports = {
          "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write --ignore-unknown"],
          "*.{json,md,html,css,scss,yaml,yml}": "prettier --write --ignore-unknown"
        };
        ```
        *Nota: `--ignore-unknown` para Prettier previne erros se arquivos não suportados forem capturados pelo glob.*
*   **Porquê:** Automatiza a verificação e formatação do código, garantindo que apenas código conforme os padrões seja commitado, melhorando a qualidade da base de código e reduzindo o ruído em code reviews.

## 7. Comandos Comuns (Scripts NPM)

Os seguintes scripts devem estar configurados no `package.json`:

*   `"lint"`: `"eslint ."` (Verifica todos os arquivos)
*   `"lint:fix"`: `"eslint . --fix"` (Tenta corrigir problemas automaticamente)
*   `"format"`: `"prettier --write ."` (Formata todos os arquivos com Prettier)
*   `"test"`: `"vitest run"`
*   `"test:watch"`: `"vitest"`
*   `"test:coverage"`: `"vitest run --coverage"`

---
Este guia deve ser usado em conjunto com o `docs/developer/coding-standards.md` para uma compreensão completa dos padrões de desenvolvimento do Project Wiz.
