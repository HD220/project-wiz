# Tarefa: FE-SETUP-001 - Configurar estrutura de arquivos e pontos de entrada para o novo frontend Vite/React.

**ID da Tarefa:** `FE-SETUP-001`
**Título Breve:** Configurar estrutura de arquivos e pontos de entrada para o novo frontend Vite/React.
**Descrição Completa:**
Configurar a estrutura de arquivos base e os pontos de entrada (entry points) para a nova aplicação frontend que utilizará Vite e React, conforme definido em `ARCH-FE-STRUCT-001`. Isso inclui a criação dos diretórios principais e a configuração inicial dos arquivos `index.html` e `main.tsx`.

---

**Status:** `Concluído`
**Dependências (IDs):** `ARCH-FE-STRUCT-001`
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P0` (Base para todo o desenvolvimento FE)
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-setup-vite`
**Commit da Conclusão (Link):** `Commit da Conclusão (Link)` (Nota: Link exato não estava no TASKS.md original)

---

## Critérios de Aceitação
- Sub-tarefas FE-SETUP-001.1 a FE-SETUP-001.6 concluídas.
- Estrutura de diretórios base para o novo frontend criada em `src_refactored/presentation/ui/` e `src_refactored/presentation/electron/renderer/` (posteriormente ajustada para apenas `src_refactored/presentation/ui/`).
- `index.html` e `main.tsx` movidos e ajustados para a nova localização.
- Configurações do Vite (`vite.renderer.config.mts`) atualizadas para refletir os novos pontos de entrada e aliases.
- Verificação básica da execução do novo renderer (mesmo que manual inicialmente).

---

## Notas/Decisões de Design
- Sub-tarefas FE-SETUP-001.1 a FE-SETUP-001.6 concluídas.
- Estrutura base e configs Vite ajustadas. (Nota original da tarefa)
- O diretório `src_refactored/presentation/electron/renderer/` foi inicialmente criado mas depois removido quando `index.html` e `main.tsx` foram movidos para `src_refactored/presentation/ui/`.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
