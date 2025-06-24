# Tarefa: LINT-FIX-001.1 - Executar `npm run lint -- --fix` para correção automática inicial e listar erros restantes.

**ID da Tarefa:** `LINT-FIX-001.1`
**Título Breve:** Executar `npm run lint -- --fix` para correção automática inicial e listar erros restantes.
**Descrição Completa:**
Executar o comando `npm run lint -- --fix` para permitir que o ESLint corrija automaticamente o máximo de problemas possível. Após a execução, analisar a saída para identificar e listar os erros que permanecem, agrupando-os por módulo ou pasta principal para facilitar as próximas etapas de correção manual.

---

**Status:** `Pendente`
**Dependências (IDs):** `LINT-FIX-001, CONFIG-ESLINT-001.2`
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P2`
**Responsável:** `Jules`
**Branch Git Proposta:** `fix/lint-auto-pass` (Sugestão)
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Comando `npm run lint -- --fix` executado no projeto.
- Uma lista ou resumo dos erros de lint restantes é produzida e adicionada aos comentários desta tarefa ou a um artefato vinculado.
- As correções automáticas são commitadas (se desejado como um commit separado).

---

## Notas/Decisões de Design
- Esta etapa visa reduzir o esforço manual nas etapas subsequentes.
- É importante verificar se as correções automáticas não introduzem regressões.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
