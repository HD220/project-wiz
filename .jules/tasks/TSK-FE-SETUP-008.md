# Tarefa: FE-SETUP-008 - Configurar TanStack Query para gerenciamento de estado do servidor.

**ID da Tarefa:** `FE-SETUP-008`
**Título Breve:** Configurar TanStack Query para gerenciamento de estado do servidor.
**Descrição Completa:**
Instalar e configurar o TanStack Query (anteriormente React Query) para gerenciar o estado do servidor na nova aplicação frontend. Isso envolve a criação de um `QueryClient` e o encapsulamento da aplicação com o `QueryClientProvider` no `main.tsx`.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-001.6`
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P1` (Essencial para buscar e cachear dados)
**Responsável:** `Frontend` (Originalmente, mas Jules pode iniciar)
**Branch Git Proposta:** `feat/fe-setup-tanstack-query`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Pacote `@tanstack/react-query` (e `@tanstack/react-query-devtools`, opcionalmente) instalado.
- Uma instância global do `QueryClient` criada.
- O componente raiz da aplicação (em `main.tsx`) envolvido com `<QueryClientProvider client={queryClient}>`.
- (Opcional) React Query Devtools configurado para ambiente de desenvolvimento.
- Um exemplo simples de `useQuery` para buscar dados (mesmo que mockados inicialmente ou via uma chamada IPC placeholder) para demonstrar a configuração.

---

## Notas/Decisões de Design
- Configurar `QueryClientProvider` em `presentation/ui/main.tsx`. (Nota original da tarefa)
- Definir configurações padrão para o `QueryClient` (ex: `staleTime`, `cacheTime`) se desejado.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
