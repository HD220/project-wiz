# Tarefa: FE-SETUP-001.5.2 - Ajustar vite.renderer.config.mts - Aliases.

**ID da Tarefa:** `FE-SETUP-001.5.2`
**Título Breve:** Ajustar `vite.renderer.config.mts` - Aliases.
**Descrição Completa:**
Ajustar a seção `resolve.alias` no arquivo de configuração do Vite para o renderer (`vite.renderer.config.mts`) para que os aliases de caminho (ex: `@/`) apontem corretamente para os diretórios dentro da nova estrutura do frontend em `src_refactored/presentation/ui/`.

---

**Status:** `Concluído`
**Dependências (IDs):** `FE-SETUP-001.1`
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P0`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-setup-vite-config`
**Commit da Conclusão (Link):** `Commit da Conclusão (Link)` (Nota: Link exato não estava no TASKS.md original)

---

## Critérios de Aceitação
- `resolve.alias` em `vite.renderer.config.mts` atualizado.
- O alias `@/` (e quaisquer outros aliases customizados) resolve para `src_refactored/presentation/ui/` ou seus subdiretórios conforme definido.
- Imports usando esses aliases funcionam corretamente no código da aplicação.

---

## Notas/Decisões de Design
- `resolve.alias` atualizado para `src_refactored/presentation/ui/`. (Nota original da tarefa)

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
