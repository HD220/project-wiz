# Tarefa: FE-SETUP-003.2 - Criar Estrutura Dir e Arquivo Raiz Rotas (`__root.tsx`)

**ID da Tarefa:** `FE-SETUP-003.2`
**Título Breve:** Criar Estrutura Dir e Arquivo Raiz Rotas (`__root.tsx`)
**Descrição Completa:**
Criar o diretório `src_refactored/presentation/ui/features/` se ele ainda não existir (este é o `routesDirectory` configurado para o plugin TanStack Router no Vite). Dentro deste diretório, criar o arquivo `__root.tsx`. Este arquivo servirá como o layout raiz para todas as rotas da aplicação e deve conter, no mínimo, um componente React que renderize `<Outlet />` do TanStack Router para exibir as rotas filhas.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-003.1`
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P0`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-setup-tanstack-router`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- O diretório `src_refactored/presentation/ui/features/` existe.
- O arquivo `src_refactored/presentation/ui/features/__root.tsx` é criado.
- O `__root.tsx` contém um componente React funcional que importa e renderiza o componente `<Outlet />` de `@tanstack/react-router`.
- Opcionalmente, pode incluir um layout básico (HTML semântico, talvez um componente `ThemeProvider` ou similar se já estiver disponível).

---

## Notas/Decisões de Design
- O nome `__root.tsx` é uma convenção comum para o arquivo de layout raiz no TanStack Router quando se usa file-based routing.
- O diretório `features` foi escolhido como `routesDirectory` na configuração do Vite.

---

## Comentários
- Sub-tarefa de `FE-SETUP-003`.

---

## Histórico de Modificações da Tarefa (Opcional)
- (Data Atual) Criada.
