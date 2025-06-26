# Tarefa: FE-COMP-SIDEBAR-APP - Implementar AppSidebar

**ID da Tarefa:** `FE-COMP-SIDEBAR-APP`
**Título Breve:** Implementar `AppSidebar` (sidebar/app-sidebar.tsx equivalente).
**Descrição Completa:**
Reimplementar o componente `AppSidebar` na nova estrutura do frontend. Este componente é a barra lateral principal da aplicação, visível quando o usuário está logado, e contém links de navegação globais, uma lista de projetos do usuário e um botão para adicionar novos projetos.

---

**Status:** `Concluído`
**Dependências (IDs):** `FE-SETUP-002 (Shadcn base)` (Componentes Shadcn/UI como Tooltip, ScrollArea, Separator, Button são usados diretamente)
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P1` (Navegação principal)
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-comp-app-sidebar`
**Commit da Conclusão (Link):** `(Link para o commit no branch feat/fe-comp-app-sidebar após o push)`

---

## Critérios de Aceitação
- Componente `AppSidebar.tsx` criado em `src_refactored/presentation/ui/components/layout/AppSidebar.tsx`. **(Concluído)**
- Links de navegação principais implementados (Dashboard, Projetos, Settings) usando TanStack Router `<Link>` e `lucide-react` icons. **(Concluído)**
- Funcionalidade para listar projetos do usuário implementada com placeholder data e `<Link>` para rotas parametrizadas. **(Concluído)**
- Botão "Adicionar Projeto" presente (ícone no header da lista de projetos e botão no rodapé). **(Concluído)**
- Utiliza componentes base do Shadcn/UI (`Button`, `ScrollArea`, `Separator`). **(Concluído)**
- Design responsivo básico considerado (setup para ser `fixed` em mobile e `static` em desktop, com largura fixa em desktop). **(Concluído)**

---

## Notas/Decisões de Design
- Inclui links de navegação principais, uma seção para lista de projetos (com dados placeholder), e botões "Adicionar Projeto".
- Utiliza `lucide-react` para ícones.
- A lista de projetos e a funcionalidade dos botões "Adicionar Projeto" são placeholders; a lógica real (busca de dados, abertura de modais) será em tarefas separadas.
- A responsividade total (ex: sidebar colapsável/drawer em mobile com botão de toggle) dependerá de um componente de layout pai (`AppShell`) e/ou gerenciamento de estado global, que estão fora do escopo desta tarefa. O componente está estruturado para suportar isso.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`
- `(Data Atual): Implementada e submetida a estrutura básica do AppSidebar com placeholders e navegação inicial.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
