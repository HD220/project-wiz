# Tarefa: LINT-IMPORT-001 - Refinar configuração da regra import/order em eslint.config.js

**ID da Tarefa:** `LINT-IMPORT-001`
**Título Breve:** Refinar configuração da regra import/order em eslint.config.js
**Descrição Completa:**
Refinar a configuração da regra `import/order` no arquivo `eslint.config.js` com base no exemplo fornecido na documentação ou nas melhores práticas do projeto. Isso inclui a definição de `pathGroups`, `newlines-between` imports de diferentes grupos, e `alphabetize` para ordenar imports dentro de cada grupo.

---

**Status:** `Concluído`
**Dependências (IDs):** `CONFIG-ESLINT-001.2`
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P3` (Padronização de código)
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/lint-import-order`
**Commit da Conclusão (Link):** `Last commit on branch`

---

## Critérios de Aceitação
- Regra `import/order` configurada em `eslint.config.js` com `pathGroups` definidos para a estrutura do projeto.
- Opções como `newlines-between: 'always'` (ou conforme decidido) e `alphabetize: { order: 'asc', caseInsensitive: true }` (ou conforme decidido) estão configuradas.
- A configuração promove uma ordenação clara e consistente das declarações de import.

---

## Notas/Decisões de Design
- Regra configurada em `eslint.config.js`.
- Verificação com `npm run lint` falhou devido a erro de ambiente no momento da conclusão original. (Nota original da tarefa)

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
