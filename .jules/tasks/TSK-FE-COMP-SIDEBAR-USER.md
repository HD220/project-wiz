# Tarefa: FE-COMP-SIDEBAR-USER - Implementar UserSidebar

**ID da Tarefa:** `FE-COMP-SIDEBAR-USER`
**Título Breve:** Implementar `UserSidebar` (sidebar/user-sidebar.tsx equivalente).
**Descrição Completa:**
Reimplementar o componente `UserSidebar` na nova estrutura do frontend. Esta barra lateral é para a seção do usuário, exibindo o nome do usuário, links de navegação para configurações de perfil, dashboard do usuário, lista de Mensagens Diretas (DMs), etc. Deve ser resizável.

---

**Status:** `Em Andamento`
**Dependências (IDs):** `FE-SETUP-002 (Shadcn base)` (Componentes Shadcn/UI como ScrollArea, Button, Avatar, Separator são usados diretamente. Resizable functionality will depend on parent using ResizablePanel.)
**Complexidade (1-5):** `3`
**Prioridade (P0-P4):** `P1` (Navegação da seção do usuário)
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-comp-user-sidebar`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Componente `UserSidebar.tsx` criado em `src_refactored/presentation/ui/features/user/components/UserSidebar.tsx`. **(Concluído)**
- Exibe o nome do usuário atual e avatar (placeholders, dados dinâmicos virão depois). **(Concluído)**
- Contém links de navegação para as diferentes seções do usuário (ex: Friends, Shop) usando TanStack Router `<Link>` e `lucide-react` icons. **(Concluído)**
- Exibe uma lista de DMs (placeholder, dados dinâmicos virão depois) com avatares e nomes. **(Concluído)**
- Funcionalidade de redimensionamento: O componente é estruturado para ser colocado dentro de um `ResizablePanel`. A implementação do grupo resizable é externa. **(Considerado Concluído para escopo do componente)**
- Utiliza componentes base do Shadcn/UI (`ScrollArea`, `Button`, `Avatar`, `Separator`). **(Concluído)**

---

## Notas/Decisões de Design
- O componente `UserSidebar` é projetado para ser o conteúdo de um painel redimensionável, com uma estética inspirada no Discord.
- Informações do usuário, lista de DMs e funcionalidade de botões (e.g., "Find or start a conversation", "Create DM") são placeholders. A integração com dados reais e lógica de backend será em tarefas futuras.
- Links de navegação usam TanStack Router.
- Ícones de `lucide-react` são usados para melhorar a interface.
- Largura fixa de `w-60` foi usada, similar a sidebars de DMs do Discord.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`
- `(Data Atual): Implementada a estrutura básica do UserSidebar com placeholders, navegação e lista de DMs, seguindo um estilo Discord-like.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
