# Tarefa: FE-SETUP-003.4 - Integrar RouterProvider no `main.tsx` e Teste Básico

**ID da Tarefa:** `FE-SETUP-003.4`
**Título Breve:** Integrar RouterProvider no `main.tsx` e Teste Básico
**Descrição Completa:**
Modificar o ponto de entrada da aplicação React, `src_refactored/presentation/ui/main.tsx`, para integrar o TanStack Router. Isso envolve:
1. Importar `createRouter` e `RouterProvider` de `@tanstack/react-router`.
2. Importar o `routeTree` gerado (de `../routeTree.gen.ts` - o path relativo a `main.tsx`).
3. Criar uma instância do router: `const router = createRouter({ routeTree });`.
4. No método `root.render`, substituir o componente `App` placeholder (se ainda existir) por `<RouterProvider router={router} />`.
5. Tentar executar `npm run type-check` para uma verificação estática da integração.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-003.3`
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P0`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-setup-tanstack-router`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- O arquivo `src_refactored/presentation/ui/main.tsx` é atualizado para instanciar o router e usar o `RouterProvider`.
- As importações necessárias de `@tanstack/react-router` e do `routeTree.gen.ts` são adicionadas.
- A aplicação (conceitualmente) deve agora usar o TanStack Router para gerenciar a navegação.
- O comando `npm run type-check` (se executável no ambiente) passa sem erros relacionados à configuração do router, ou a análise estática do código indica que a configuração está correta.

---

## Notas/Decisões de Design
- Esta é a etapa final para a configuração básica do TanStack Router.
- A execução real da aplicação para verificar a rota de exemplo será parte da validação da tarefa `FE-SETUP-001.6` (Verificar Execução Básica Novo Renderer) ou de uma tarefa de teste de UI mais abrangente.

---

## Comentários
- Sub-tarefa de `FE-SETUP-003`.

---

## Histórico de Modificações da Tarefa (Opcional)
- (Data Atual) Criada.
