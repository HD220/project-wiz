# Tarefa: LINT-FIX-001.6 - Corrigir erros de lint manualmente nas pastas `tests/`, `scripts/` e arquivos de config.

**ID da Tarefa:** `LINT-FIX-001.6`
**Título Breve:** Corrigir erros de lint manualmente nas pastas `tests/`, `scripts/` e arquivos de config.
**Descrição Completa:**
Analisar e corrigir manualmente os erros de lint restantes nas pastas de testes (`tests/`), scripts (`scripts/`, se ainda relevantes após o cleanup planejado) e arquivos de configuração na raiz do projeto (ex: `vite.config.mts`, `lingui.config.ts`, etc.), após a execução da correção automática.

---

**Status:** `Pendente`
**Dependências (IDs):** `LINT-FIX-001.1`
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P2`
**Responsável:** `Jules`
**Branch Git Proposta:** `fix/lint-tests-scripts-config` (Sugestão)
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Todos os erros de lint reportados pelo ESLint para as pastas e arquivos especificados são corrigidos.
- As correções aderem às convenções de código e melhores práticas estabelecidas.

---

## Notas/Decisões de Design
- Verificar a relevância da pasta `scripts/` à luz da tarefa `CLEANUP-001`.
- Arquivos de configuração podem ter regras ESLint específicas ou desabilitadas que precisam ser consideradas.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
