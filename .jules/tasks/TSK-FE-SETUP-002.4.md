# Tarefa: FE-SETUP-002.4-REVISED - Ajustar `components.json` (Existente) para Nova Estrutura

**ID da Tarefa:** `FE-SETUP-002.4-REVISED`
**Título Breve:** Ajustar `components.json` (Existente) para Nova Estrutura
**Descrição Completa:**
Utilizar o arquivo `components.json` localizado na tarefa `FE-SETUP-002.1-REVISED`. Mover este arquivo para a raiz do projeto, se ainda não estiver lá. Atualizar o path em `tailwind.css` para `src_refactored/presentation/ui/styles/globals.css`. Ajustar os `aliases.components` e `aliases.utils` para que funcionem corretamente com o alias principal `@/` do Vite (que aponta para `src_refactored/presentation/ui/`) e os novos locais dos componentes e utilitários em `src_refactored/presentation/ui/components` e `src_refactored/presentation/ui/lib/utils` respectivamente.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-002.2-REVISED`
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P0`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-migrate-shadcn`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- O arquivo `components.json` original é movido para a raiz (se necessário) e seu conteúdo é ajustado.
- O campo `tailwind.css` aponta para `src_refactored/presentation/ui/styles/globals.css`.
- Os campos `aliases.components` e `aliases.utils` estão configurados para resolver para os diretórios corretos dentro de `src_refactored/presentation/ui/` (e.g., `@/components`, `@/lib/utils`).

---

## Notas/Decisões de Design
- Garante que o CLI do Shadcn (para adicionar futuros componentes) funcione com a nova estrutura.

---

## Comentários
- Tarefa revisada para reconfiguração do `components.json`.

---

## Histórico de Modificações da Tarefa (Opcional)
- (Data Atual) Revisada para reconfiguração do `components.json`.
