# Tarefa: FE-SETUP-006 - Configurar ESLint, Prettier para qualidade de código no novo FE.

**ID da Tarefa:** `FE-SETUP-006`
**Título Breve:** Configurar ESLint, Prettier para qualidade de código no novo FE.
**Descrição Completa:**
Garantir que as configurações de ESLint e Prettier existentes no projeto (especialmente `eslint.config.js`) sejam aplicadas e funcionem corretamente para o novo código frontend em `src_refactored/presentation/ui/`. Isso pode envolver ajustes nos caminhos ou extensões de arquivo cobertos pelas configurações.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-001.6` (estrutura base do FE pronta), `CONFIG-ESLINT-001.2` (config ESLint principal consolidada)
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P1` (Qualidade de código desde o início)
**Responsável:** `Frontend` (Originalmente, mas Jules pode iniciar)
**Branch Git Proposta:** `feat/fe-setup-linting`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- `npm run lint` e `npm run format` (ou comandos equivalentes) funcionam corretamente para os arquivos dentro de `src_refactored/presentation/ui/`.
- As regras ESLint (incluindo as de React, TypeScript, import order, etc.) são aplicadas ao novo código.
- Prettier formata o novo código conforme as regras do projeto.
- Não há conflitos significativos entre as regras do ESLint e Prettier.

---

## Notas/Decisões de Design
- O objetivo é manter a consistência da qualidade do código em toda a base de código.
- Pode ser necessário instalar plugins ESLint específicos para React/JSX se ainda não estiverem globalmente configurados de forma a abranger `.tsx`.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
