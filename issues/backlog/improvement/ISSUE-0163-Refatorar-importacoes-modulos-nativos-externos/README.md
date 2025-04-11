# ISSUE-0163: Refatorar importações de módulos nativos externos

## Tipo

improvement

---

## Contexto

O projeto utiliza Electron com Vite e marca os módulos nativos `"better-sqlite3"`, `"sqlite3"`, `"keytar"`, `"@node-llama-cpp"` e `"node-llama-cpp"` como `external` na configuração `vite.main.config.mts`.

Para evitar erros de build e runtime, **todos esses módulos devem ser importados dinamicamente (`import()`) ou via `createRequire`**, nunca com `import` estático.

Foram detectadas importações estáticas incorretas para `keytar` e `node-llama-cpp` em múltiplos arquivos.

---

## Objetivo

Refatorar o código para que **todas as importações desses módulos `external`**:

- Sejam feitas **dinamicamente** com `await import('modulo')`
- Ou usando `createRequire` do módulo `module` do Node.js
- Tratem erros de import de forma segura

---

## Escopo

### Arquivos afetados

- `src/core/services/auth/AuthRepositoryKeytar.ts`
- `src/core/infrastructure/electron/github-token-manager.ts`
- `src/core/infrastructure/electron/github/GitHubTokenManagerGateway.ts`
- `src/core/infrastructure/electron/adapters/credential-storage.adapter.ts`
- `src/core/infrastructure/worker/adapters/WorkerServiceAdapter.ts`
- `src/core/infrastructure/worker/adapters/ModelManagerAdapter.ts`
- `src/core/infrastructure/llm/adapters/MistralGGUFAdapter.ts`

### Critérios de aceitação

- **Nenhuma importação estática** para `"keytar"` ou `"node-llama-cpp"` deve permanecer nesses arquivos.
- As importações devem ser feitas **dinamicamente** ou via `createRequire`.
- O código deve tratar erros de import (ex: módulo não encontrado) de forma segura.
- O projeto deve continuar funcionando normalmente após a mudança.
- O comando `npm run start` deve rodar sem erros relacionados a esses módulos.
- O build deve ser possível sem erros relacionados a esses módulos.

---

## Exemplo de refatoração

**Antes (errado):**

```ts
import keytar from 'keytar';
import { LlamaChatSession } from 'node-llama-cpp';
```

**Depois (correto):**

```ts
// Usando createRequire
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const keytar = require('keytar');
const llamaCpp = require('node-llama-cpp');

// Ou usando import dinâmico (async)
const keytar = await import('keytar');
const llamaCpp = await import('node-llama-cpp');
```

---

## Notas técnicas

- Para arquivos TypeScript que não suportam top-level await, use funções assíncronas para carregar os módulos.
- Se preferir, crie um **helper** para carregar módulos nativos dinamicamente e reutilize.
- Atualize eventuais chamadas e tipagens conforme necessário.
- Garanta que erros de importação sejam tratados para evitar crashes.

---

## Próximos passos

1. Diagnóstico detalhado: localizar todas as importações estáticas desses módulos.
2. Planejar a refatoração: escolher entre `createRequire` ou `import()` para cada caso.
3. Implementar a refatoração nos arquivos listados.
4. Testar o projeto (`npm run start` e build).
5. Revisar e documentar a mudança.