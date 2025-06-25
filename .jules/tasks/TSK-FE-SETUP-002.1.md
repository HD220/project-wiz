# Tarefa: FE-SETUP-002.1 - Executar `npx shadcn-ui@latest init` e configuração inicial

**ID da Tarefa:** `FE-SETUP-002.1`
**Título Breve:** Executar `npx shadcn-ui@latest init` e configuração inicial
**Descrição Completa:**
Esta tarefa envolve executar o comando `npx shadcn-ui@latest init` no terminal para iniciar a configuração da biblioteca Shadcn/UI. O desenvolvedor deverá responder aos prompts do CLI conforme as necessidades do projeto (ex: TypeScript, style, base color, globals.css location, tailwind.config.js location, aliases).

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-002`
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P0`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-setup-shadcn`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- O comando `npx shadcn-ui@latest init` é executado com sucesso.
- O arquivo `components.json` é criado na raiz do projeto.
- O arquivo `tailwind.config.ts` (ou `.js`) é modificado/criado com as configurações base do Shadcn/UI.
- O arquivo `globals.css` é modificado com os estilos base do Shadcn/UI.
- As configurações escolhidas nos prompts são apropriadas para o projeto (ex: `src_refactored/presentation/ui/styles/globals.css` para CSS, `tailwind.config.ts`, aliases `@/*` para `src_refactored/presentation/ui/*`).

---

## Notas/Decisões de Design
- Esta é a primeira sub-tarefa para a instalação do Shadcn/UI.
- Assegurar que os caminhos para `globals.css`, `tailwind.config.ts` e os aliases de componentes (`@/components`, `@/lib/utils`) estejam corretos e apontem para a nova estrutura em `src_refactored/presentation/ui/`.

---

## Comentários
- Criada como parte do desmembramento de `FE-SETUP-002`.

---

## Histórico de Modificações da Tarefa (Opcional)
-
