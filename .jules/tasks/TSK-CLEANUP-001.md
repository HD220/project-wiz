# Tarefa: CLEANUP-001 - Remover pastas e arquivos internos não mais utilizados

**ID da Tarefa:** `CLEANUP-001`
**Título Breve:** Remover pastas e arquivos internos não mais utilizados
**Descrição Completa:**
Remover pastas e arquivos internos que não são mais utilizados no projeto. As pastas identificadas inicialmente são: `/.roo`, `/backup`, `/config`, `/scripts`, `/types` e conteúdo legado de `/tests`.

---

**Status:** `Pendente`
**Dependências (IDs):** `FASE-5-COMPLETA` (Indica que esta limpeza deve ocorrer após a conclusão da Fase 5 de refatoração)
**Complexidade (1-5):** `3`
**Prioridade (P0-P4):** `P3` (Limpeza, menos crítico que features ou correções de bugs)
**Responsável:** `Jules`
**Branch Git Proposta:** `chore/cleanup-unused-files` (Sugestão)
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Pastas `/.roo`, `/backup`, `/config`, `/scripts`, `/types` (e seu conteúdo) removidas do repositório se confirmado que não são mais necessárias.
- Conteúdo legado da pasta `/tests` (não relacionado à nova estrutura de testes com Vitest ou scripts de verificação ainda em uso) removido.
- Confirmação de que nenhum script essencial (ex: scripts de build, CI/CD, Vitest) ainda depende de arquivos dentro das pastas a serem removidas.

---

## Notas/Decisões de Design
- **Importante:** Verificar cuidadosamente se Vitest ou outros scripts/processos ainda utilizam algo em `/tests` antes da remoção total da pasta ou de subpastas específicas. A remoção deve ser feita com cautela.
- A dependência `FASE-5-COMPLETA` sugere que esta tarefa é uma das últimas da fase de refatoração.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
