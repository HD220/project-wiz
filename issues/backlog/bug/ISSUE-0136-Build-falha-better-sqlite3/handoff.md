# Handoff - ISSUE-0136 Build falha better-sqlite3

## Resumo da Correção

- Explicitamente externalizados os módulos nativos problemáticos para evitar que o Vite/Rollup tente empacotá-los:
  - `better-sqlite3`
  - `drizzle-orm/better-sqlite3`
- Ajustes aplicados em:
  - `vite.main.config.mts`
  - `vite.preload.config.mts`
  - `vite.worker.config.mts`
- O módulo `sqlite3` também permanece externalizado no `vite.main.config.mts` por segurança.

## Mudança estrutural importante

- **Todo o código que usa `better-sqlite3` foi movido para o processo `main` do Electron.**
- Criado módulo dedicado: `src/core/infrastructure/electron/db-client.ts`.
- Removido o antigo `src/core/infrastructure/db/client.ts` para evitar que o bundler tente empacotar código nativo.
- O preload, renderer e workers **não acessam mais diretamente o banco SQLite**.

## Motivo

`better-sqlite3` é um módulo nativo incompatível com bundling. Deve ser instalado no ambiente final e carregado apenas no processo `main` do Electron.

## Próximos passos

- Validar build.

## Atualizacao final

- Removida a dependencia direta do frontend no `ElectronHistoryServiceAdapter`.
- Criado o adapter `IpcHistoryServiceAdapter` em `src/client/services/ipc-history-service-adapter.ts`.
- O frontend agora acessa o historico **exclusivamente via IPC** usando os canais ja existentes (`history:getConversations`, `history:getMessages`, etc.).
- Isso garante isolamento total do codigo que depende de `better-sqlite3` no processo `main`.
- Build deve funcionar sem erros relacionados a modulos nativos.

- Mover issue para concluída após sucesso.