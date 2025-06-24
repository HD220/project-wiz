# Tarefa: CONFIG-ESLINT-001.2 - Migrar ignorePatterns para eslint.config.js e remover .eslintrc.json

**ID da Tarefa:** `CONFIG-ESLINT-001.2`
**Título Breve:** Migrar `ignorePatterns` para `eslint.config.js` e remover `.eslintrc.json`.
**Descrição Completa:**
Migrar as configurações de `ignorePatterns` do arquivo `.eslintignore` (e de `.eslintrc.json` se presentes lá) para o novo arquivo de configuração `eslint.config.js`. Remover o arquivo `.eslintignore` e, se existir e for redundante, o `.eslintrc.json`.

---

**Status:** `Concluído`
**Dependências (IDs):** `CONFIG-ESLINT-001.1` (Nota: CONFIG-ESLINT-001.1 não estava no TASKS.md original, assumindo que era um passo implícito ou pré-requisito já atendido para a criação do eslint.config.js)
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P2`
**Responsável:** `Jules`
**Branch Git Proposta:** `refactor/eslint-config`
**Commit da Conclusão (Link):** `Last commit on branch`

---

## Critérios de Aceitação
- Padrões de `.eslintignore` movidos para a seção `ignores` em `eslint.config.js`.
- Arquivo `.eslintignore` removido do projeto.
- Arquivo `.eslintrc.json` removido se existir e suas configurações tiverem sido migradas.

---

## Notas/Decisões de Design
- Padrões de `.eslintignore` movidos para `eslint.config.js`.
- `.eslintignore` removido.
- `.eslintrc.json` não encontrado.
- Verificação com `npm run lint` falhou devido a erro de ambiente no momento da conclusão original. (Nota original da tarefa)

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
