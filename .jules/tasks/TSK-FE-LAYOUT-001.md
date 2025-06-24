# Tarefa: FE-LAYOUT-001 - Implementar Root Layout do Router.

**ID da Tarefa:** `FE-LAYOUT-001`
**Título Breve:** Implementar Root Layout do Router
**Descrição Completa:**
Implementar o layout raiz para o TanStack Router (ex: `__root.tsx`). Este componente será o layout mais externo da aplicação, geralmente contendo elementos globais como provedores de tema, provedor de query client, e o `<Outlet/>` onde as rotas aninhadas serão renderizadas.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-002` (Shadcn/UI para possíveis componentes de layout base), `FE-SETUP-003` (TanStack Router configurado), `ARCH-FE-UI-STRUCT-001` (estrutura de pastas definida)
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P0` (Estrutura fundamental da UI)
**Responsável:** `Frontend` (Originalmente, mas Jules pode iniciar)
**Branch Git Proposta:** `feat/fe-layout-root`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Arquivo de layout raiz (ex: `src_refactored/presentation/ui/routes/__root.tsx`) criado.
- O layout raiz inclui o componente `<Outlet />` do TanStack Router para renderizar rotas filhas.
- Provedores globais essenciais (ex: `ThemeProvider` do Shadcn/UI, `QueryClientProvider` do TanStack Query) são configurados neste layout ou no `main.tsx` se mais apropriado (decidir e documentar).
- (Opcional) Pode incluir elementos de layout persistentes muito básicos, se houver (embora mais comum em layouts aninhados).

---

## Notas/Decisões de Design
- Define a estrutura visual global com `<Outlet/>`.
- Providers globais (Theme, QueryClient, etc.) são configurados em `presentation/ui/main.tsx` ou aqui. A nota original indica `main.tsx` para providers, o que é uma prática comum. O `__root.tsx` focaria mais na estrutura visual e no `<Outlet />`.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
