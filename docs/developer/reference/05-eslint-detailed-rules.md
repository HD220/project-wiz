# Propostas de Configuração de Regras ESLint Adicionais

Data: 2024-07-15

Este documento detalha propostas para novas regras ESLint a serem incorporadas ao projeto `Project Wiz`, baseadas em um exemplo de configuração fornecido. O objetivo é melhorar a padronização, manutenibilidade e qualidade do código. As regras devem ser adaptadas para o formato `eslint.config.js` (flat config) e para a estrutura de pastas atual (`src`).

## 1. Modularidade de Importações (Ref. `LINT-CUSTOM-001`)

**Regra Exemplo:** `project-structure/independent-modules` (plugin customizado/terceiro)

*   **Propósito:** Reforçar a arquitetura modular, controlando de onde cada módulo/pasta pode importar código. Isso é crucial para manter a Clean Architecture e evitar acoplamento indesejado.
*   **Configuração Exemplo (adaptada conceitualmente):**
    ```javascript
    // Em eslint.config.js, dentro de um objeto de configuração
    // plugins: { 'project-structure': projectStructurePlugin }, // Necessário instalar e importar o plugin
    // rules: {
    //   'project-structure/independent-modules': ['warn', {
    //     modules: [
    //       {
    //         name: "Domain Layer (Core)",
    //         pattern: "src/core/domain/**",
    //         allowImportsFrom: [
    //           "{self}", // Permite importações dentro do próprio módulo
    //           "src/core/common/**", // Common utilities for core
    //           "src/shared/**" // Shared utilities (Result, etc.)
    //           // NÃO PODE importar de application, infrastructure, presentation
    //         ],
    //         errorMessage: "🔥 Domain layer can only import from itself, core/common, or shared. 🔥"
    //       },
    //       {
    //         name: "Application Layer (Core)",
    //         pattern: "src/core/application/**",
    //         allowImportsFrom: [
    //           "{self}",
    //           "src/core/domain/**",
    //           "src/core/common/**",
    //           "src/core/ports/**", // Portas definidas no core
    //           "src/shared/**"
    //           // NÃO PODE importar de infrastructure, presentation
    //         ],
    //         errorMessage: "🔥 Application layer can import from itself, domain, core/common, core/ports, or shared. 🔥"
    //       },
    //       {
    //         name: "Infrastructure Layer",
    //         pattern: "src/infrastructure/**",
    //         allowImportsFrom: [
    //           "{self}",
    //           "src/core/application/**", // Casos de uso, portas de app
    //           "src/core/domain/**", // Entidades, VOs (ex: para DTOs de repositório)
    //           "src/core/common/**",
    //           "src/core/ports/**",
    //           "src/shared/**",
    //           // Pode ter dependências externas (npm packages)
    //         ],
    //         errorMessage: "🔥 Infrastructure layer has specific import rules. 🔥"
    //       },
    //       {
    //         name: "Presentation Layer (React UI, Electron IPC Handlers)",
    //         pattern: [
    //            "src/infrastructure/frameworks/react/**",
    //            "src/infrastructure/frameworks/electron/main/handlers/**"
    //            // Adicionar outros padrões da camada de apresentação
    //         ],
    //         allowImportsFrom: [
    //           "{self}",
    //           "src/core/application/**", // Para chamar casos de uso
    //           "src/shared/**", // Tipos IPC, etc.
    //           "src/infrastructure/ioc/**", // Para DI
    //           // Pode ter dependências externas (npm packages de UI)
    //         ],
    //         errorMessage: "🔥 Presentation layer has specific import rules. 🔥"
    //       },
    //       {
    //         name: "Shared Utilities",
    //         pattern: "src/shared/**",
    //         allowImportsFrom: ["{self}"], // Shared não deve importar de camadas superiores
    //         errorMessage: "🔥 Shared utilities should not import from core or infrastructure layers directly. 🔥"
    //       }
    //     ],
    //     reusableImportPatterns: {
    //       // Poderia definir aqui padrões reutilizáveis se o plugin suportar
    //     }
    //   }]
    // }
    ```
*   **Adaptação para Project Wiz:**
    *   **Pesquisa:** Investigar se `eslint-plugin-project-structure` é compatível com "flat config" ou se alternativas como `eslint-plugin-import` (com `no-restricted-paths`) ou `eslint-plugin-boundaries` podem atingir um resultado similar.
    *   Definir os `pattern` e `allowImportsFrom` com base na arquitetura de `src` (domain, application, infrastructure, presentation, shared, core/common, core/ports).
*   **Exemplo (Conceitual para Clean Architecture):**
    *   **Ruim:** `src/core/domain/job.entity.ts` importando de `src/infrastructure/repositories/drizzle/job.repository.ts`.
    *   **Bom:** `src/infrastructure/repositories/drizzle/job.repository.ts` importando de `src/core/domain/job.entity.ts`.

## 2. Padronização de Componentes React (Ref. `LINT-REACT-001`)

**Regra Exemplo:** `react/function-component-definition`

*   **Propósito:** Padronizar como componentes funcionais React são definidos (declaration vs arrow function).
*   **Configuração Exemplo:**
    ```javascript
    // rules: {
    //   "react/function-component-definition": ["warn", { // ou 2 para error
    //     "namedComponents": "function-declaration",    // ex: export function MyComponent() {}
    //     "unnamedComponents": "arrow-function"       // ex: export default () => {}; const Comp = () => {};
    //   }]
    // }
    ```
*   **Adaptação para Project Wiz:**
    *   Instalar `eslint-plugin-react` se ainda não estiver (parece que não está no `eslint.config.js` atual).
    *   Adicionar o plugin e a regra à configuração de arquivos `*.tsx`.
    *   Decidir a convenção preferida (exemplo usa `function-declaration` para nomeados).
*   **Exemplo:**
    *   **Bom (conforme exemplo):** `export function MyButton() { return <button /> }`
    *   **Ruim (conforme exemplo):** `export const MyButton = () => { return <button /> }` (para componentes nomeados exportados)

## 3. Ordem de Importações (Ref. `LINT-IMPORT-001`)

**Regra Exemplo:** `import/order`

*   **Propósito:** Manter uma ordem consistente para as declarações `import`, melhorando a legibilidade.
*   **Configuração Atual (parcial em `eslint.config.js`):** O plugin `eslint-plugin-import` já está listado. A regra `import/no-unresolved` está ativa.
*   **Configuração Exemplo (para refinar):**
    ```javascript
    // rules: {
    //   "import/order": ["warn", {
    //     "groups": ["builtin", "external", "internal", ["parent", "sibling", "index"], "type"],
    //     "pathGroups": [
    //       { "pattern": "react", "group": "external", "position": "before" },
    //       { "pattern": "@/**", "group": "internal" } // Ajustar para aliases do projeto
    //     ],
    //     "pathGroupsExcludedImportTypes": ["react"],
    //     "newlines-between": "always", // Adiciona linha em branco entre grupos
    //     "alphabetize": { "order": "asc", "caseInsensitive": true }
    //   }]
    // }
    ```
*   **Adaptação para Project Wiz:**
    *   Revisar os `pathGroups` para corresponder aos aliases de caminho usados (ex: `@/refactored/*`, `@/shared/*`).
    *   Adotar `newlines-between: "always"` e `alphabetize`.
*   **Exemplo:**
    ```typescript
    // Bom (após configuração)
    import fs from 'node:fs'; // builtin

    import React from 'react'; // external (react antes)
    import { Button } from 'some-ui-library'; // external

    import { MyService } from '@/refactored/core/application/services'; // internal (@/)
    import { AnotherComponent } from '@/refactored/infrastructure/ui/components'; // internal

    import { ParentUtil } from '../utils'; // parent
    import { SiblingComponent } from './Sibling'; // sibling
    import MainHook from '.'; // index

    import type { MyType } from './types'; // type
    ```

## 4. Convenção de Nomenclatura TypeScript (Ref. `LINT-TS-001`)

**Regra Exemplo:** `@typescript-eslint/naming-convention`

*   **Propósito:** Padronizar a nomeação de variáveis, funções, classes, tipos, interfaces, enums, etc.
*   **Configuração Exemplo:**
    ```javascript
    // rules: {
    //   "@typescript-eslint/naming-convention": ["warn",
    //     { "selector": "default", "format": ["camelCase"], "leadingUnderscore": "allow", "trailingUnderscore": "allow" },
    //     { "selector": "variable", "format": ["camelCase", "PascalCase", "UPPER_CASE"], "leadingUnderscore": "allow", "trailingUnderscore": "allow" },
    //     { "selector": "function", "format": ["camelCase", "PascalCase"] },
    //     { "selector": "parameter", "format": ["camelCase"], "leadingUnderscore": "allow" },
    //     { "selector": "typeLike", "format": ["PascalCase"] }, // Classes, Interfaces, Tipos Literais, Enums
    //     { "selector": "enumMember", "format": ["PascalCase", "UPPER_CASE"] }
    //   ]
    // }
    ```
*   **Adaptação para Project Wiz:**
    *   Adotar esta regra. As configurações do exemplo são um bom ponto de partida.
    *   Discutir e ajustar os `format` para cada `selector` se necessário, para alinhar com as preferências do time (ex: permitir `snake_case` para constantes `UPPER_CASE` se for o caso).
*   **Exemplo:**
    *   **Bom:** `const myVariable = ...; function doSomething() {} interface IMyInterface {} type MyType = ...; enum MyEnum { ValueOne, ValueTwo }`
    *   **Ruim:** `const my_variable = ...; function Do_Something() {} interface iMyInterface {} type myType = ...; enum my_enum { value_one }`

## 5. Regras de Complexidade e Tamanho de Código (Ref. `LINT-COMPLEXITY-001`)

*   **Propósito:** Promover código mais simples, legível e manutenível, alinhado com os princípios do Object Calisthenics.
*   **Regras Exemplo e Configurações:**
    *   **`max-depth`**: Limita o aninhamento de blocos.
        `// "max-depth": ["warn", { "max": 2 }]` (Alinhado com OC: Um nível de indentação)
    *   **`no-else-return`**: Desencoraja `else` após `return`.
        `// "no-else-return": "warn"` (Alinhado com OC)
    *   **`id-length`**: Define tamanho mínimo/máximo para nomes de identificadores.
        `// "id-length": ["warn", { "min": 3, "exceptions": ["id", "db", "ui", "en", "pt", "i", "X", "Y", "Z", "x", "y", "z", "a", "b", "e", "fs", "vo"] }]` (Adicionar exceções comuns como `vo`, `fs`)
    *   **`max-lines-per-function`**: Limita o número de linhas por função/método.
        `// "max-lines-per-function": ["warn", { "max": 15, "skipBlankLines": true, "skipComments": true }]` (Alinhado com OC: métodos pequenos)
    *   **`max-statements`**: Limita o número de declarações por função/método.
        `// "max-statements": ["warn", { "max": 10 }]` (Ajustar o `max` conforme necessidade, 10-15 é razoável)
    *   **`max-lines`**: Limita o número de linhas por arquivo, com overrides.
        ```javascript
        // (Dentro de um objeto de configuração global ou específico para arquivos .ts)
        // rules: { "max-lines": ["warn", { "max": 200, "skipBlankLines": true, "skipComments": true }] }
        // (E em objetos de configuração separados para overrides)
        // { files: ["src/core/domain/**/*.ts", "src/core/application/**/*.ts"], rules: { "max-lines": ["warn", { "max": 100 }] } }
        // { files: ["*.tsx"], rules: { "max-lines": ["warn", { "max": 250 }] } }
        ```
*   **Adaptação para Project Wiz:**
    *   Adotar estas regras, ajustando os limites (`max`, `min`, `exceptions`) conforme apropriado para o projeto.
    *   Os overrides para `max-lines` devem usar os caminhos de `src`.
    *   Considerar o RNF-COD-002 (Object Calisthenics) ao definir esses limites.

## Implementação Geral
*   Todas as regras e plugins devem ser adicionados ao(s) objeto(s) de configuração relevantes em `eslint.config.js`.
*   Será necessário instalar quaisquer novos plugins ESLint via `npm install --save-dev <plugin-name>`.
*   Após a configuração, `npm run lint -- --fix` (se aplicável para auto-correção) e uma revisão manual serão necessários para aplicar as novas regras ao codebase. A tarefa `LINT-FIX-001` cobrirá a correção dos erros de lint existentes.

Este documento serve como base para as tarefas de linting subsequentes.
