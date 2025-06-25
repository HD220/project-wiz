# Tarefa: FE-SETUP-002.2 - Validar e ajustar `components.json` (aliases)

**ID da Tarefa:** `FE-SETUP-002.2`
**Título Breve:** Validar e ajustar `components.json` (aliases)
**Descrição Completa:**
Após a execução do `shadcn-ui init`, esta tarefa consiste em verificar o arquivo `components.json` gerado. Especificamente, validar e, se necessário, ajustar os aliases de caminho para componentes (`components`) e utilitários (`utils`) para que correspondam à estrutura definida do projeto em `src_refactored/presentation/ui/`.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-002.1`
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P0`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-setup-shadcn`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- O arquivo `components.json` existe na raiz do projeto.
- O alias `components` em `components.json` (ex: `$.components`) aponta corretamente para `src_refactored/presentation/ui/components`.
- O alias `utils` em `components.json` (ex: `$.utils`) aponta corretamente para `src_refactored/presentation/ui/lib/utils`.
- Os caminhos de importação (`paths`) no `tsconfig.json` (ou `tsconfig.base.json`) estão consistentes com os aliases do `components.json` (ex: `@/*: ["src_refactored/presentation/ui/*"]`).

---

## Notas/Decisões de Design
- Esta tarefa garante que os componentes Shadcn/UI sejam instalados nos diretórios corretos e que os imports funcionem conforme esperado.
- A estrutura alvo é `src_refactored/presentation/ui/components` para componentes e `src_refactored/presentation/ui/lib/utils` para utilitários.

---

## Comentários
- Criada como parte do desmembramento de `FE-SETUP-002`.

---

## Histórico de Modificações da Tarefa (Opcional)
-
