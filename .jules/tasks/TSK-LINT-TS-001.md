# Tarefa: LINT-TS-001 - Adicionar e configurar regra @typescript-eslint/naming-convention

**ID da Tarefa:** `LINT-TS-001`
**Título Breve:** Adicionar e configurar regra @typescript-eslint/naming-convention
**Descrição Completa:**
Adicionar e configurar a regra `@typescript-eslint/naming-convention` no `eslint.config.js` para impor padronizações de nomes em todo o código TypeScript do projeto. Isso inclui nomes de variáveis, funções, classes, interfaces, tipos, enums, etc.

---

**Status:** `Pendente`
**Dependências (IDs):** `CONFIG-ESLINT-001.2`
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P3` (Padronização de código)
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/lint-ts-naming`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Regra `@typescript-eslint/naming-convention` configurada em `eslint.config.js`.
- As convenções de nomenclatura são definidas e acordadas (ex: `camelCase` para variáveis/funções, `PascalCase` para classes/interfaces/tipos/enums).
- A configuração cobre diferentes seletores e modificadores (ex: `variable`, `function`, `class`, `interface`, `typeAlias`, `enumMember`, `parameter`, `property`, `method`, `accessor`, `enum`, `private`, `public`, `protected`, `static`, `readonly`, `abstract`).
- `npm run lint` aplica as novas convenções de nomenclatura.

---

## Notas/Decisões de Design
- Requer discussão e acordo sobre as convenções de nomenclatura a serem aplicadas em todo o projeto. (Nota original da tarefa)
- A complexidade '2' reflete a necessidade de definir essas convenções e configurar a regra detalhadamente.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
