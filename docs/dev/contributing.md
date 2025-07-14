# Padrões, Contribuições e Convenções (contributing.md)

Este documento descreve os padrões de código, convenções e o processo de contribuição para o projeto **project-wiz**. Seguir estas diretrizes garante a consistência, legibilidade e manutenibilidade do código.

## 1. Padrões de Código e Estilo

O projeto utiliza **ESLint** para análise estática de código e **Prettier** para formatação automática. É crucial que todo o código novo e modificado esteja em conformidade com as regras definidas.

### 1.1. Formatação (Prettier)

As regras de formatação são definidas em `.prettierrc.json`:

- `semi`: `true` (usa ponto e vírgula no final das declarações)
- `trailingComma`: `all` (vírgulas pendentes em objetos, arrays, etc.)
- `singleQuote`: `false` (usa aspas duplas para strings)
- `printWidth`: `80` (largura máxima da linha)
- `tabWidth`: `2` (largura da indentação)

**Ação:** Certifique-se de que seu editor de código está configurado para usar o Prettier na hora de salvar, ou execute o script de formatação antes de commitar:

```bash
npm run format
```

### 1.2. Análise de Código (ESLint)

As regras do ESLint são definidas em `eslint.config.js`. Algumas regras notáveis incluem:

- **Tipagem:** Uso obrigatório de TypeScript, com `no-explicit-any` como erro e `no-unused-vars` como aviso.
- **Convenção de Nomenclatura (`@typescript-eslint/naming-convention`):**
  - `camelCase` para variáveis, funções, parâmetros.
  - `PascalCase` para classes, interfaces, tipos, enums.
  - `UPPER_CASE` para constantes globais ou membros de enum.
  - Permite `snake_case` para propriedades de objetos literais, propriedades de tipo e propriedades de classes, especialmente para interoperabilidade com APIs externas.
- **Restrições de Sintaxe:**
  - **Proibido o uso direto de `ipcMain.handle`:** Deve-se usar `createIpcHandler` do `src/main/kernel/ipc-handler-utility`.
  - **Proibido o uso direto de `window.electronIPC.invoke`:** Deve-se usar os hooks `useIpcQuery` ou `useIpcMutation` no frontend.
- **Complexidade de Código:** Avisos para funções muito longas (`max-lines-per-function`), muitos statements (`max-statements`) e profundidade de aninhamento (`max-depth`).
- **Importações:** Regras de ordenação de importações (`import/order`) e regras de fronteira (`boundaries/element-types`) para impor a arquitetura em camadas (DDD).

**Ação:** Execute o linter regularmente durante o desenvolvimento:

```bash
npm run lint
```

### 1.3. Estrutura de Arquivos e Módulos

Siga a estrutura de pastas e a arquitetura hexagonal/DDD descritas em `architecture.md` e `modules.md`. Mantenha os módulos coesos e com responsabilidades bem definidas.

## 2. Processo de Contribuição

### 2.1. Branches

Utilizamos o fluxo de trabalho Gitflow simplificado ou Feature Branching:

- `main`: Branch principal, contém o código estável e pronto para release.
- `develop`: Branch de desenvolvimento, onde as features são integradas antes de serem promovidas para `main`.
- `feature/<nome-da-feature>`: Branches para novas funcionalidades. Devem ser criadas a partir de `develop`.
- `bugfix/<nome-do-bug>`: Branches para correção de bugs. Devem ser criadas a partir de `develop` ou `main` (para hotfixes).

### 2.2. Commits

Siga as convenções de Conventional Commits para mensagens de commit. Isso facilita a geração automática de changelogs e a compreensão do histórico do projeto.

Exemplos:

- `feat: Adiciona funcionalidade de criação de projeto`
- `fix: Corrige erro de validação no formulário de agente`
- `docs: Atualiza documentação de arquitetura`
- `refactor: Refatora serviço de mensagens de canal`
- `test: Adiciona testes para o módulo LLM Provider`
- `chore: Atualiza dependências`

### 2.3. Pull Requests (PRs)

- Crie PRs para integrar suas branches de `feature` ou `bugfix` em `develop`.
- Certifique-se de que todos os testes estão passando (`npm run test`).
- Verifique se o linter não reporta erros (`npm run lint`).
- Descreva claramente as mudanças, o problema que resolve e como foi testado.
- Solicite revisão de código de pelo menos um colega de equipe.

## 3. Decisões Arquiteturais Importantes (ADR - Architecture Decision Records)

Para decisões arquiteturais significativas, considere criar um ADR. Embora não haja um diretório formal de ADRs no momento, a prática de documentar o _porquê_ de certas escolhas é encorajada. Isso pode ser feito em comentários de código, na documentação geral ou em um arquivo `design-decisions.md` futuro.

**Exemplos de decisões documentadas no ESLint:**

- A proibição do uso direto de `ipcMain.handle` e `window.electronIPC.invoke` é uma decisão arquitetural para centralizar e padronizar a comunicação IPC através de utilitários e hooks, melhorando a segurança e a manutenibilidade.
- As regras de `boundaries/element-types` no ESLint reforçam a arquitetura em camadas (DDD), garantindo que as dependências entre os módulos sigam um fluxo unidirecional e que as camadas não se misturem indevidamente.
