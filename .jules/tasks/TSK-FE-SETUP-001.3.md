# Tarefa: FE-SETUP-001.3 - Mover e ajustar main.tsx para src_refactored/presentation/ui/main.tsx.

**ID da Tarefa:** `FE-SETUP-001.3`
**Título Breve:** Mover e ajustar `main.tsx` para `src_refactored/presentation/ui/main.tsx`.
**Descrição Completa:**
Mover o arquivo `main.tsx` (ponto de entrada da aplicação React) da sua localização original (provavelmente `src_refactored/presentation/electron/renderer/main.tsx` após `FE-SETUP-001.1`) para a nova localização definitiva em `src_refactored/presentation/ui/main.tsx`. Ajustar os imports dentro do arquivo para refletir a nova estrutura de pastas e remover configurações desnecessárias (como i18n, se for ser reconfigurado depois).

---

**Status:** `Concluído`
**Dependências (IDs):** `FE-SETUP-001.1`
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P0`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-finalize-basic-renderer-setup`
**Commit da Conclusão (Link):** `Commit da Conclusão (Link)` (Nota: Link exato não estava no TASKS.md original)

---

## Critérios de Aceitação
- Arquivo `main.tsx` movido para `src_refactored/presentation/ui/main.tsx`.
- Imports internos ajustados para a nova localização (ex: para `App.tsx`, `styles/globals.css`).
- Configuração de i18n (LinguiJS) removida temporariamente se for ser reavaliada/reconfigurada em tarefa separada (`FE-SETUP-004`).

---

## Notas/Decisões de Design
- Movido de `presentation/electron/renderer/`, i18n removida, imports ajustados para `presentation/ui/`. (Nota original da tarefa)
- Esta mudança centraliza os arquivos raiz da UI em `presentation/ui/`.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
