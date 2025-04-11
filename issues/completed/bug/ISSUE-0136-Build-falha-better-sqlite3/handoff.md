# Handoff - ISSUE-0136 Build falha better-sqlite3

## Problema
Erro de build causado pelo módulo nativo `better-sqlite3`, que não pode ser empacotado pelo Vite/Rollup.

## Ações realizadas
- Confirmada configuração correta no arquivo `vite.main.config.mts`, marcando `better-sqlite3` e `sqlite3` como dependências externas (`external`).
- Convertidos os imports estáticos de `better-sqlite3` e `drizzle-orm/better-sqlite3` no arquivo `src/core/infrastructure/db/client.ts` para **imports dinâmicos** via `await import()`, garantindo que esses módulos só sejam carregados em tempo de execução.
- Dessa forma, o empacotador não tenta incluir os módulos nativos no bundle, evitando erros de build.

## Resultado esperado
- Build funcionando normalmente, sem erros relacionados ao `better-sqlite3`.
- O módulo nativo será carregado apenas em runtime, devendo estar instalado no ambiente final.

## Recomendações
- Garantir que `better-sqlite3` esteja instalado no ambiente onde a aplicação será executada.
- Se necessário, ajustar scripts de deploy para incluir as dependências nativas.