# Handoff - ISSUE-0234-Centralizar-tipo-DocFile-shared-types

## Histórico de Progresso

- 2025-04-12 [code] Centralizado o tipo `DocFile` em `src/shared/types/doc-file.ts`.
- Atualizados todos os arquivos do projeto para importar `DocFile` do novo local compartilhado.
- Removida a definição duplicada de `DocFile` do mock (`src/client/mocks/mock-doc-files.ts`).
- Garantida a conformidade com clean code, eliminando dependências de mocks para tipagem e padronizando os imports.

## Decisões Tomadas

- O tipo `DocFile` foi movido para a camada `shared/types` para evitar dependência de mocks em código de produção e promover reutilização e clareza.
- Todos os arquivos que utilizavam `DocFile` passaram a importar do novo local centralizado.
- Não foram realizadas alterações fora do escopo da issue.

## Próximos Passos

- Realizar revisão final e testes de integração, pois a alteração é apenas de tipagem/import.
- Encerrar a issue após validação.