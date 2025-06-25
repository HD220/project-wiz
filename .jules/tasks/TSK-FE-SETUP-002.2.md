# Tarefa: FE-SETUP-002.2-REVISED - Mover Componentes e Utils Shadcn/UI para `src_refactored`

**ID da Tarefa:** `FE-SETUP-002.2-REVISED`
**Título Breve:** Mover Componentes e Utils Shadcn/UI para `src_refactored`
**Descrição Completa:**
Mover os componentes de UI do Shadcn existentes da sua localização original em `src/` (provavelmente `src/infrastructure/frameworks/react/components/ui/` ou similar) para o novo diretório `src_refactored/presentation/ui/components/ui/`. Mover também o arquivo de utilitários `utils.ts` (contendo a função `cn`) da sua localização original em `src/` (provavelmente `src/infrastructure/frameworks/react/lib/`) para `src_refactored/presentation/ui/lib/utils.ts`.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-002.1-REVISED`
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P0`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-migrate-shadcn`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Todos os componentes Shadcn/UI existentes são movidos de `src/.../ui/` para `src_refactored/presentation/ui/components/ui/`.
- O arquivo `utils.ts` (com `cn`) é movido de `src/.../lib/` para `src_refactored/presentation/ui/lib/utils.ts`.
- A estrutura de diretórios em `src_refactored/presentation/ui/` reflete os novos locais para componentes e utilitários.

---

## Notas/Decisões de Design
- Garante que os artefatos do Shadcn/UI estejam na nova estrutura de frontend antes de reconfigurar os arquivos de metadados.

---

## Comentários
- Tarefa revisada para focar na migração dos arquivos existentes.

---

## Histórico de Modificações da Tarefa (Opcional)
- (Data Atual) Revisada para migração de arquivos.
