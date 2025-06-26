# Tarefa: FE-LAYOUT-001 - Implementar Root Layout do Router.

**ID da Tarefa:** `FE-LAYOUT-001`
**Título Breve:** Implementar Root Layout do Router
**Descrição Completa:**
Implementar o layout raiz para o TanStack Router (ex: `__root.tsx`). Este componente será o layout mais externo da aplicação, geralmente contendo elementos globais como provedores de tema, provedor de query client, e o `<Outlet/>` onde as rotas aninhadas serão renderizadas.

---

**Status:** `Concluído`
**Dependências (IDs):** `FE-SETUP-002` (Shadcn/UI para possíveis componentes de layout base), `FE-SETUP-003` (TanStack Router configurado), `ARCH-FE-UI-STRUCT-001` (estrutura de pastas definida)
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P0` (Estrutura fundamental da UI)
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-layout-root`
**Commit da Conclusão (Link):** `(Link para o commit no branch feat/fe-layout-root após o push)`

---

## Critérios de Aceitação
- Arquivo de layout raiz (ex: `src_refactored/presentation/ui/routes/__root.tsx`) criado. **(Concluído)**
- O layout raiz inclui o componente `<Outlet />` do TanStack Router para renderizar rotas filhas. **(Concluído)**
- Provedores globais essenciais (ex: `ThemeProvider` do Shadcn/UI, `QueryClientProvider` do TanStack Query) são configurados neste layout. **(Concluído)**
- (Opcional) Pode incluir elementos de layout persistentes muito básicos, se houver (embora mais comum em layouts aninhados). (Não incluído nesta etapa)

---

## Notas/Decisões de Design
- Define a estrutura visual global com `<Outlet/>`.
- Providers globais (`ThemeProvider`, `QueryClientProvider`) foram configurados diretamente no `__root.tsx` para encapsular todas as rotas.
- Um novo componente `ThemeProvider` foi criado em `src_refactored/presentation/ui/components/common/theme-provider.tsx` para gerenciar temas light/dark/system e interagir com `localStorage` e classes CSS no `<html>` element.
- O `main.tsx` não necessitou de alterações, pois o `routeTree.gen.ts` (gerado pelo TanStack Router) é esperado para incorporar o `__root.tsx` automaticamente.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`
- `(Data Atual): Implementação concluída e submetida. Criado __root.tsx com ThemeProvider e QueryClientProvider. ThemeProvider básico implementado.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
