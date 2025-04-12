# Handoff - ISSUE-0240-Mover-handle-auth-error-para-shared-utils

## Histórico de Progresso

- **12/04/2025** - *Aberta por Code*: Issue criada para mover o helper `handleAuthError` para a camada compartilhada conforme Clean Architecture e ADR-0012.
- **12/04/2025** - *Concluído por Code*: O arquivo `handle-auth-error.ts` foi movido de `src/client/lib/` para `src/shared/utils/`, conforme definido na issue e ADR-0012. Todos os imports em `auth-api.ts` e `auth-actions.ts` foram atualizados para o novo caminho. O arquivo antigo foi removido. A mudança garante centralização e reutilização do helper na camada compartilhada, alinhada à Clean Architecture. Eventuais erros de TypeScript em outros imports não são escopo desta issue.


## Próximos Passos

- Implementar a movimentação do arquivo e atualizar referências.
- Validar aderência às regras do projeto e ADR-0012.
- Atualizar este handoff com decisões e progresso.

## Referências

- [README.md](./README.md)
- [ADR-0012-Clean-Architecture-LLM](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md)
- [rules.md](../../../.roo/rules/rules.md)