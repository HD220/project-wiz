# Handoff - ISSUE-0236-Mover-export-history-shared-utils

- **Data:** 2025-04-12
- **Responsável:** Code mode
- **Ação:** Criação da issue de melhoria no backlog.
- **Justificativa:** O utilitário `exportDataAsFile` está em local inadequado (`src/client/lib/export-history.ts`). A ação visa mover para `src/shared/utils` conforme Clean Architecture e [ADR-0012-Clean-Architecture-LLM](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md), promovendo reutilização e separação de responsabilidades.

---

- **Data:** 2025-04-12
- **Responsável:** Code mode
- **Ação:** Arquivo `export-history.ts` movido de `src/client/lib/` para `src/shared/utils/`.
- **Justificativa:** Execução conforme escopo da issue e ADR-0012. Não foi necessário atualizar imports, pois não há referências ao utilitário no projeto neste momento. A estrutura agora está adequada para futuras reutilizações cross-layer.