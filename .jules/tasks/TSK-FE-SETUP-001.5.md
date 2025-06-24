# Tarefa: FE-SETUP-001.5 - Configurar Vite (vite.renderer.config.mts) para o Novo Ponto de Entrada.

**ID da Tarefa:** `FE-SETUP-001.5`
**Título Breve:** Configurar Vite (`vite.renderer.config.mts`) para o Novo Ponto de Entrada.
**Descrição Completa:**
Ajustar o arquivo de configuração do Vite para o renderer (`vite.renderer.config.mts`) para refletir a nova localização do ponto de entrada da UI em `src_refactored/presentation/ui/`. Isso inclui atualizar o `root`, aliases de caminho, e configurações de plugins como o TanStack Router.

---

**Status:** `Concluído`
**Dependências (IDs):** `FE-SETUP-001.4`
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P0`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-setup-vite-config`
**Commit da Conclusão (Link):** `Commit da Conclusão (Link)` (Nota: Link exato não estava no TASKS.md original)

---

## Critérios de Aceitação
- Sub-tarefas FE-SETUP-001.5.1 a FE-SETUP-001.5.3 concluídas.
- `vite.renderer.config.mts` aponta para `src_refactored/presentation/ui/` como o `root`.
- Aliases de caminho no Vite (ex: `@/`) resolvidos corretamente para a nova estrutura.
- Configuração do plugin TanStack Router no Vite atualizada para a nova localização das rotas.
- `outDir` do Vite configurado corretamente.

---

## Notas/Decisões de Design
- `vite.renderer.config.mts` atualizado (root, aliases, router plugin, outDir).
- `forge.config.cts` não precisou de alteração para entry point HTML, pois isso é gerenciado pela config `root` do Vite. (Nota original da tarefa)

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
