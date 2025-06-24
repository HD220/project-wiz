# Tarefa: FE-COMP-MODE-TOGGLE - Implementar ModeToggle

**ID da Tarefa:** `FE-COMP-MODE-TOGGLE`
**Título Breve:** Implementar `ModeToggle` (mode-toggle.tsx equivalente).
**Descrição Completa:**
Reimplementar o componente `ModeToggle` que permite ao usuário alternar entre os temas claro e escuro da aplicação. Este componente geralmente usa um ícone (sol/lua) e um dropdown ou botões para selecionar o tema. Deve se integrar com o `ThemeProviderContext` (ou o contexto de tema do Shadcn/UI).

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-002 (Shadcn base), FE-COMP-UI-001, FE-COMP-UI-008 (DropdownMenu)` (Nota: FE-COMP-UI-* foram canceladas; a dependência real é em componentes base Shadcn/UI como Button, DropdownMenu)
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P2` (Melhoria da UX)
**Responsável:** `Frontend`
**Branch Git Proposta:** `feat/fe-comp-mode-toggle`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Componente `ModeToggle.tsx` criado em `src_refactored/presentation/ui/components/common/` (ou local apropriado).
- Utiliza componentes do Shadcn/UI como `Button` e `DropdownMenu` para a interface.
- Integra-se com o provedor de tema do Shadcn/UI (geralmente `next-themes` ou uma solução similar configurada durante o setup do Shadcn/UI) para ler e alterar o tema atual.
- Exibe ícones apropriados (sol/lua) que mudam com o tema.
- Permite ao usuário selecionar "Claro", "Escuro" ou "Sistema".

---

## Notas/Decisões de Design
- Integrar com `ThemeProviderContext`. (Nota original da tarefa)
- As dependências originais `FE-COMP-UI-001` e `FE-COMP-UI-008` foram canceladas. A intenção é usar os componentes Shadcn/UI diretamente.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
