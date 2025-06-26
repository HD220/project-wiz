# Tarefa: REFACTOR-NAMING-001 - Padronizar Nomes de Arquivos para kebab-case

**ID da Tarefa:** `REFACTOR-NAMING-001`
**Título Breve:** Padronizar Nomes de Arquivos para kebab-case
**Descrição Completa:**
Analisar todos os arquivos no repositório e renomear aqueles que não seguem o padrão kebab-case (ex: `meuArquivo.ts` -> `meu-arquivo.ts`, `MinhaClasse.tsx` -> `minha-classe.tsx`). Exceções devem ser aplicadas para arquivos onde o nome é mandatório por ferramentas ou convenções estabelecidas (e.g., `README.md`, `package.json`, `vite.config.mts`, `eslint.config.js`, arquivos de componentes React que usam PascalCase por convenção de framework/equipe se decidido).

---

**Status:** `Pendente`
**Dependências (IDs):** ``
**Complexidade (1-5):** `3` (Potencialmente alto devido ao número de arquivos e necessidade de atualizar importações)
**Prioridade (P0-P4):** `P3`
**Responsável:** `Jules`
**Branch Git Proposta:** `refactor/kebab-case-filenames`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- A maioria dos arquivos no projeto (especialmente em `src`, `src_refactored`, `tests`) são renomeados para kebab-case.
- As importações e referências a esses arquivos são atualizadas em todo o código para refletir os novos nomes.
- O projeto continua compilando e funcionando (testes básicos passam, se executáveis).
- Uma lista de exceções (arquivos que não devem ser renomeados) é documentada ou implícita pelas exclusões.
- Arquivos de componentes React (e.g. `.tsx`) podem manter PascalCase para o nome do arquivo se essa for a convenção da equipe para componentes, mas isso deve ser decidido. (Para esta tarefa, vamos assumir que `.tsx` componentes também vão para kebab-case, a menos que a convenção PascalCase para arquivos de componentes seja explicitamente preferida e documentada).

---

## Notas/Decisões de Design
- **Escopo Inicial:** Focar em `src_refactored/`, `src/` (o que ainda for relevante), e `tests/`. Outras áreas (`scripts/`, `docs/`) podem ser secundárias ou fora do escopo inicial se muito complexo.
- **Exceções Comuns:** `package.json`, `README.md`, `AGENTS.md`, `*.config.js`, `*.config.ts`, `*.config.mts`, `index.ts`, `index.html`, `main.ts` (entry point Electron), `preload.ts`. Nomes de arquivos de definição de tipo (`*.d.ts`) podem também ser exceções.
- **Componentes React (.tsx):** A convenção comum é `PascalCase.tsx` para arquivos de componentes. Decidir se isso será uma exceção ou se serão convertidos para `kebab-case.tsx`. *Decisão para esta tarefa: Tentar converter para kebab-case, a menos que cause problemas significativos ou haja forte objeção.*
- **Impacto:** Renomear arquivos pode gerar muitos conflitos de merge se outras branches estiverem ativas. Coordenar essa tarefa.
- **Ferramentas:** Pode ser útil um script para encontrar arquivos não conformes. A renomeação e atualização de imports pode ser parcialmente automatizada por IDEs, mas exigirá revisão cuidadosa.

---

## Comentários
- `(2024-07-25 por @Jules): Tarefa criada a pedido do usuário para padronizar nomes de arquivos.`

---
