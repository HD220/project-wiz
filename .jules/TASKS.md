# Tabela Principal de Tarefas

**Status:** Pendente, Em Andamento, Concluído, Bloqueado, Revisão, Cancelado
**Prioridade (P0-P4):** P0 (Crítica), P1 (Alta), P2 (Média), P3 (Baixa), P4 (Muito Baixa)

| ID da Tarefa | Título Breve da Tarefa | Status | Dependências (IDs) | Prioridade | Responsável | Link para Detalhes | Notas Breves |
|--------------|------------------------|--------|--------------------|------------|-------------|--------------------|--------------|
| APP-SVC-001  | Implementar GenericAgentExecutor | Bloqueado | DOM-AGENT-005, DOM-JOB-010, APP-PORT-004, DOM-TOOL-001 | P1 | Jules | [TSK-APP-SVC-001.md](./tasks/TSK-APP-SVC-001.md) | Subdividido |
| APP-SVC-001.8| Unit Tests for GenericAgentExecutor | Concluído | APP-SVC-001.7.2 | P1 | Jules | [TSK-APP-SVC-001.8.md](./tasks/TSK-APP-SVC-001.8.md) | Testes não executados |
| APP-SVC-001.8.1.IMPL| Testes de config e init GenericAgentExecutor | Concluído | APP-SVC-001.8.1 | P1 | Jules | [TSK-APP-SVC-001.8.1.IMPL.md](./tasks/TSK-APP-SVC-001.8.1.IMPL.md) | Testes não executados |
| APP-SVC-001.8.2.IMPL| Testes job simples sem tool_calls (sucesso) | Concluído | APP-SVC-001.8.2 | P1 | Jules | [TSK-APP-SVC-001.8.2.IMPL.md](./tasks/TSK-APP-SVC-001.8.2.IMPL.md) | Testes não executados |
| APP-SVC-001.8.3.IMPL| Testes job atingindo maxIterations | Concluído | APP-SVC-001.8.3 | P1 | Jules | [TSK-APP-SVC-001.8.3.IMPL.md](./tasks/TSK-APP-SVC-001.8.3.IMPL.md) | Testes não executados |
| APP-SVC-001.8.4.IMPL| Testes erro ILLMAdapter.generateText | Concluído | APP-SVC-001.8.4 | P1 | Jules | [TSK-APP-SVC-001.8.4.IMPL.md](./tasks/TSK-APP-SVC-001.8.4.IMPL.md) | Testes não executados |
| APP-SVC-001.8.5.IMPL| Testes job com tool_call bem-sucedido | Concluído | APP-SVC-001.8.5 | P1 | Jules | [TSK-APP-SVC-001.8.5.IMPL.md](./tasks/TSK-APP-SVC-001.8.5.IMPL.md) | Testes não executados |
| APP-SVC-001.8.6.IMPL| Testes tool_call com ToolError recuperável | Concluído | APP-SVC-001.8.6 | P1 | Jules | [TSK-APP-SVC-001.8.6.IMPL.md](./tasks/TSK-APP-SVC-001.8.6.IMPL.md) | Testes não executados |
| APP-SVC-001.8.7.IMPL| Testes tool_call com ToolError não recuperável | Concluído | APP-SVC-001.8.7 | P1 | Jules | [TSK-APP-SVC-001.8.7.IMPL.md](./tasks/TSK-APP-SVC-001.8.7.IMPL.md) | Testes não executados |
| APP-SVC-001.8.8.IMPL| Testes erro "Tool not found" | Concluído | APP-SVC-001.8.8 | P1 | Jules | [TSK-APP-SVC-001.8.8.IMPL.md](./tasks/TSK-APP-SVC-001.8.8.IMPL.md) | Testes não executados |
| APP-SVC-001.8.9.IMPL| Testes falha validação args de ferramenta | Concluído | APP-SVC-001.8.9 | P1 | Jules | [TSK-APP-SVC-001.8.9.IMPL.md](./tasks/TSK-APP-SVC-001.8.9.IMPL.md) | Testes não executados |
| APP-SVC-001.8.10.IMPL| Testes lógica de re-planejamento | Concluído | APP-SVC-001.8.10 | P1 | Jules | [TSK-APP-SVC-001.8.10.IMPL.md](./tasks/TSK-APP-SVC-001.8.10.IMPL.md) | Testes não executados |
| APP-SVC-002  | Implementar WorkerService | Bloqueado | DOM-JOB-011, APP-SVC-001.8, APP-PORT-003 | P1 | Jules | [TSK-APP-SVC-002.md](./tasks/TSK-APP-SVC-002.md) | Subdividido |
| APP-SVC-002.1| Definir interface IWorkerService | Pendente | APP-SVC-002, DOM-JOB-011, APP-PORT-003 | P1 | Jules | [TSK-APP-SVC-002.1.md](./tasks/TSK-APP-SVC-002.1.md) |  |
| APP-SVC-002.2| Implementar estrutura básica WorkerService | Pendente | APP-SVC-002.1 | P1 | Jules | [TSK-APP-SVC-002.2.md](./tasks/TSK-APP-SVC-002.2.md) |  |
| APP-SVC-002.3| Integrar WorkerService com IAgentExecutor | Pendente | APP-SVC-002.2, APP-SVC-001.8 | P1 | Jules | [TSK-APP-SVC-002.3.md](./tasks/TSK-APP-SVC-002.3.md) |  |
| APP-SVC-002.4| Integrar WorkerService com Fila | Pendente | APP-SVC-002.2, APP-PORT-003 | P1 | Jules | [TSK-APP-SVC-002.4.md](./tasks/TSK-APP-SVC-002.4.md) |  |
| APP-SVC-002.5| Tratar resultados/erros dos workers | Pendente | APP-SVC-002.2 | P1 | Jules | [TSK-APP-SVC-002.5.md](./tasks/TSK-APP-SVC-002.5.md) |  |
| APP-SVC-002.6| Testes unitários para WorkerService | Pendente | APP-SVC-002.1, ..., APP-SVC-002.5 | P1 | Jules | [TSK-APP-SVC-002.6.md](./tasks/TSK-APP-SVC-002.6.md) |  |
| CONFIG-ESLINT-001| Consolidar config ESLint | Concluído | - | P2 | Jules | [TSK-CONFIG-ESLINT-001.md](./tasks/TSK-CONFIG-ESLINT-001.md) | Subdividido |
| CONFIG-ESLINT-001.2| Migrar ignorePatterns para eslint.config.js | Concluído | CONFIG-ESLINT-001.1 | P2 | Jules | [TSK-CONFIG-ESLINT-001.2.md](./tasks/TSK-CONFIG-ESLINT-001.2.md) |  |
| LINT-FIX-001 | Corrigir todos os erros de lint | Bloqueado | CONFIG-ESLINT-001.2 | P2 | Jules | [TSK-LINT-FIX-001.md](./tasks/TSK-LINT-FIX-001.md) | Subdividido |
| LINT-FIX-001.1| Executar lint --fix e listar erros | Pendente | LINT-FIX-001, CONFIG-ESLINT-001.2 | P2 | Jules | [TSK-LINT-FIX-001.1.md](./tasks/TSK-LINT-FIX-001.1.md) |  |
| LINT-FIX-001.2| Corrigir lint em src/core/ | Pendente | LINT-FIX-001.1 | P2 | Jules | [TSK-LINT-FIX-001.2.md](./tasks/TSK-LINT-FIX-001.2.md) |  |
| LINT-FIX-001.3| Corrigir lint em src/infrastructure/ | Pendente | LINT-FIX-001.1 | P2 | Jules | [TSK-LINT-FIX-001.3.md](./tasks/TSK-LINT-FIX-001.3.md) |  |
| LINT-FIX-001.4| Corrigir lint em src/electron/, main.ts, shared/ | Pendente | LINT-FIX-001.1 | P2 | Jules | [TSK-LINT-FIX-001.4.md](./tasks/TSK-LINT-FIX-001.4.md) |  |
| LINT-FIX-001.5| Corrigir lint em src_refactored/ | Pendente | LINT-FIX-001.1 | P2 | Jules | [TSK-LINT-FIX-001.5.md](./tasks/TSK-LINT-FIX-001.5.md) |  |
| LINT-FIX-001.6| Corrigir lint em tests/, scripts/, configs | Pendente | LINT-FIX-001.1 | P2 | Jules | [TSK-LINT-FIX-001.6.md](./tasks/TSK-LINT-FIX-001.6.md) |  |
| LINT-FIX-001.7| Executar lint final e ajustes | Pendente | LINT-FIX-001.2,...,LINT-FIX-001.6 | P2 | Jules | [TSK-LINT-FIX-001.7.md](./tasks/TSK-LINT-FIX-001.7.md) |  |
| CLEANUP-001  | Remover arquivos/pastas não utilizados | Pendente | FASE-5-COMPLETA | P3 | Jules | [TSK-CLEANUP-001.md](./tasks/TSK-CLEANUP-001.md) |  |
| LINT-CUSTOM-001 | Pesquisar/configurar plugin modularidade | Subdividido | CONFIG-ESLINT-001.2 | P2 | Jules | [TSK-LINT-CUSTOM-001.md](./tasks/TSK-LINT-CUSTOM-001.md) | Subdividido |
| LINT-CUSTOM-001.1 | Pesquisar plugins ESLint modularidade | Concluído | LINT-CUSTOM-001 | P2 | Jules | [TSK-LINT-CUSTOM-001.1.md](./tasks/TSK-LINT-CUSTOM-001.1.md) |  |
| LINT-CUSTOM-001.2 | Configurar plugin modularidade | Pendente | LINT-CUSTOM-001.1 | P2 | Jules | [TSK-LINT-CUSTOM-001.2.md](./tasks/TSK-LINT-CUSTOM-001.2.md) |  |
| LINT-CUSTOM-001.3 | Validar/refinar config modularidade | Pendente | LINT-CUSTOM-001.2 | P2 | Jules | [TSK-LINT-CUSTOM-001.3.md](./tasks/TSK-LINT-CUSTOM-001.3.md) |  |
| LINT-REACT-001  | Configurar regra eslint function-component-definition | Pendente | CONFIG-ESLINT-001.2 | P3 | Jules | [TSK-LINT-REACT-001.md](./tasks/TSK-LINT-REACT-001.md) |  |
| LINT-IMPORT-001 | Refinar config import/order | Concluído | CONFIG-ESLINT-001.2 | P3 | Jules | [TSK-LINT-IMPORT-001.md](./tasks/TSK-LINT-IMPORT-001.md) |  |
| LINT-TS-001     | Configurar @typescript-eslint/naming-convention | Pendente | CONFIG-ESLINT-001.2 | P3 | Jules | [TSK-LINT-TS-001.md](./tasks/TSK-LINT-TS-001.md) |  |
| LINT-COMPLEXITY-001 | Configurar regras ESLint de complexidade/tamanho | Concluído | CONFIG-ESLINT-001.2 | P3 | Jules | [TSK-LINT-COMPLEXITY-001.md](./tasks/TSK-LINT-COMPLEXITY-001.md) |  |
| DOC-LINT-RULES-001 | Revisar/aprovar propostas de regras ESLint | Pendente | LINT-COMPLEXITY-001 | P2 | Usuário/Revisor | [TSK-DOC-LINT-RULES-001.md](./tasks/TSK-DOC-LINT-RULES-001.md) |  |
| ARCH-FE-STRUCT-001 | Definir estrutura de diretórios novo FE | Concluído | - | P0 | Jules (Arquiteto) | [TSK-ARCH-FE-STRUCT-001.md](./tasks/TSK-ARCH-FE-STRUCT-001.md) |  |
| DOC-UPDATE-FE-STRUCT-001 | Atualizar docs com nova estrutura FE | Concluído | ARCH-FE-STRUCT-001 | P1 | Jules (Arquiteto) | [TSK-DOC-UPDATE-FE-STRUCT-001.md](./tasks/TSK-DOC-UPDATE-FE-STRUCT-001.md) | Subdividido |
| DOC-UPDATE-FE-STRUCT-001.1 | Atualizar AGENTS.MD nova estrutura FE | Concluído | ARCH-FE-STRUCT-001, ARCH-FE-UI-STRUCT-001 | P1 | Jules (Arquiteto) | [TSK-DOC-UPDATE-FE-STRUCT-001.1.md](./tasks/TSK-DOC-UPDATE-FE-STRUCT-001.1.md) |  |
| DOC-UPDATE-FE-STRUCT-001.2 | Detalhar Arquitetura FE em arquitetura.md | Concluído | ARCH-FE-STRUCT-001, ARCH-FE-UI-STRUCT-001 | P1 | Jules (Arquiteto) | [TSK-DOC-UPDATE-FE-STRUCT-001.2.md](./tasks/TSK-DOC-UPDATE-FE-STRUCT-001.2.md) |  |
| FE-MIGRATE-SRC-CODE-001 | Meta-tarefa: Migrar código React | Cancelado | Todas FE-SETUP-*, ARCH-FE-STRUCT-001 | P0 | Frontend Team | [TSK-FE-MIGRATE-SRC-CODE-001.md](./tasks/TSK-FE-MIGRATE-SRC-CODE-001.md) | Reescrever do zero |
| FE-SETUP-001 | Configurar estrutura/entry points novo FE | Concluído | ARCH-FE-STRUCT-001 | P0 | Jules | [TSK-FE-SETUP-001.md](./tasks/TSK-FE-SETUP-001.md) | Subdividido |
| FE-SETUP-001.1 | Criar Estrutura de Diretórios Base Novo FE | Concluído | ARCH-FE-STRUCT-001 | P0 | Jules | [TSK-FE-SETUP-001.1.md](./tasks/TSK-FE-SETUP-001.1.md) |  |
| FE-SETUP-001.2 | Mover/ajustar index.html para presentation/ui/ | Concluído | FE-SETUP-001.1 | P0 | Jules | [TSK-FE-SETUP-001.2.md](./tasks/TSK-FE-SETUP-001.2.md) |  |
| FE-SETUP-001.3 | Mover/ajustar main.tsx para presentation/ui/ | Concluído | FE-SETUP-001.1 | P0 | Jules | [TSK-FE-SETUP-001.3.md](./tasks/TSK-FE-SETUP-001.3.md) |  |
| FE-SETUP-001.4 | Remover diretório presentation/electron/renderer/ | Concluído | FE-SETUP-001.2, FE-SETUP-001.3 | P0 | Jules | [TSK-FE-SETUP-001.4.md](./tasks/TSK-FE-SETUP-001.4.md) |  |
| FE-SETUP-001.5 | Configurar Vite para Novo Ponto de Entrada | Concluído | FE-SETUP-001.4 | P0 | Jules | [TSK-FE-SETUP-001.5.md](./tasks/TSK-FE-SETUP-001.5.md) | Subdividido |
| FE-SETUP-001.5.1| Analisar/Ajustar forge.config.cts novo entry HTML | Concluído | FE-SETUP-001.2 | P0 | Jules | [TSK-FE-SETUP-001.5.1.md](./tasks/TSK-FE-SETUP-001.5.1.md) |  |
| FE-SETUP-001.5.2| Ajustar vite.renderer.config.mts - Aliases | Concluído | FE-SETUP-001.1 | P0 | Jules | [TSK-FE-SETUP-001.5.2.md](./tasks/TSK-FE-SETUP-001.5.2.md) |  |
| FE-SETUP-001.5.3| Ajustar vite.renderer.config.mts - Plugin TanStack Router | Concluído | FE-SETUP-001.1 | P0 | Jules | [TSK-FE-SETUP-001.5.3.md](./tasks/TSK-FE-SETUP-001.5.3.md) |  |
| FE-SETUP-001.6| Verificar Execução Básica Novo Renderer | Concluído | FE-SETUP-001.5 | P0 | Jules | [TSK-FE-SETUP-001.6.md](./tasks/TSK-FE-SETUP-001.6.md) |  |
| FE-SETUP-002 | Instalar/configurar Shadcn/UI | Concluído | FE-SETUP-001.6, FE-SETUP-010 | P0 | Jules | [TSK-FE-SETUP-002.md](./tasks/TSK-FE-SETUP-002.md) | Migrado/Reconfigurado c/ observações (testes env) |
| FE-SETUP-002.1-REVISED| Localizar e Analisar Config Shadcn/UI Existente | Concluído | FE-SETUP-002 | P0 | Jules | [TSK-FE-SETUP-002.1.md](./tasks/TSK-FE-SETUP-002.1.md) | Análise concluída |
| FE-SETUP-002.2-REVISED| Mover Componentes e Utils Shadcn/UI para `src_refactored` | Concluído | FE-SETUP-002.1-REVISED | P0 | Jules | [TSK-FE-SETUP-002.2.md](./tasks/TSK-FE-SETUP-002.2.md) | Arquivos copiados (originais mantidos) |
| FE-SETUP-002.3-REVISED| Ajustar `tailwind.config.ts` (Existente) para Nova Estrutura | Concluído | FE-SETUP-002.2-REVISED | P0 | Jules | [TSK-FE-SETUP-002.3.md](./tasks/TSK-FE-SETUP-002.3.md) | Tailwind.config.ts recriado e ajustado |
| FE-SETUP-002.4-REVISED| Ajustar `components.json` (Existente) para Nova Estrutura | Concluído | FE-SETUP-002.2-REVISED | P0 | Jules | [TSK-FE-SETUP-002.4.md](./tasks/TSK-FE-SETUP-002.4.md) | components.json recriado e ajustado |
| RESEARCH-TAILWINDVITE-001 | Pesquisar necessidade de `tailwind.config.ts` com `@tailwindcss/vite` v4.x | Concluído | - | P0 | Jules | [TSK-RESEARCH-TAILWINDVITE-001.md](./tasks/TSK-RESEARCH-TAILWINDVITE-001.md) | Pesquisa concluída. Doc: [tailwind-vite-config-research.md](./docs/dev-notes/tailwind-vite-config-research.md) |
| FE-SETUP-002.5-REVISED| Validar Integração Shadcn Pós-Migração | Concluído | FE-SETUP-002.3-REVISED, FE-SETUP-002.4-REVISED, RESEARCH-TAILWINDVITE-001 | P0 | Jules | [TSK-FE-SETUP-002.5.md](./tasks/TSK-FE-SETUP-002.5.md) | Concluído c/ observações (testes env) |
| FE-SETUP-003 | Instalar/configurar Tanstack Router | Bloqueado | FE-SETUP-001.6 | P0 | Jules | [TSK-FE-SETUP-003.md](./tasks/TSK-FE-SETUP-003.md) | Subdividido |
| FE-SETUP-003.1| Instalar Pacotes TanStack Router e Verificar Config Plugin Vite | Concluído | FE-SETUP-003, FE-SETUP-001.5.3 | P0 | Jules | [TSK-FE-SETUP-003.1.md](./tasks/TSK-FE-SETUP-003.1.md) | Deps e config Vite OK |
| FE-SETUP-003.2| Criar Estrutura Dir e Arquivo Raiz Rotas (`__root.tsx`) | Concluído | FE-SETUP-003.1 | P0 | Jules | [TSK-FE-SETUP-003.2.md](./tasks/TSK-FE-SETUP-003.2.md) | `app/__root.tsx` criado. Vite config ajustado. |
| FE-SETUP-003.3| Criar Rota Exemplo (Index) e Verificar `routeTree.gen.ts` | Concluído | FE-SETUP-003.2 | P0 | Jules | [TSK-FE-SETUP-003.3.md](./tasks/TSK-FE-SETUP-003.3.md) | `app/index.tsx` criado. routeTree.gen.ts pendente de build. |
| FE-SETUP-003.4| Integrar RouterProvider no `main.tsx` e Teste Básico | Pendente | FE-SETUP-003.3 | P0 | Jules | [TSK-FE-SETUP-003.4.md](./tasks/TSK-FE-SETUP-003.4.md) | Usar RouterProvider, tentar type-check |
| FE-SETUP-004 | Configurar LinguiJS para i18n (Reavaliar) | Pendente | FE-SETUP-001.6 | P3 | Frontend | [TSK-FE-SETUP-004.md](./tasks/TSK-FE-SETUP-004.md) |  |
| FE-SETUP-005 | Configurar React Hook Form e Zod | Pendente | FE-SETUP-001.6 | P1 | Frontend | [TSK-FE-SETUP-005.md](./tasks/TSK-FE-SETUP-005.md) |  |
| FE-SETUP-006 | Configurar ESLint, Prettier para novo FE | Pendente | FE-SETUP-001.6, CONFIG-ESLINT-001.2 | P1 | Frontend | [TSK-FE-SETUP-006.md](./tasks/TSK-FE-SETUP-006.md) |  |
| FE-SETUP-007 | Configurar aliases de caminho Vite e tsconfig | Pendente | FE-SETUP-001.6, ARCH-FE-UI-STRUCT-001 | P1 | Frontend | [TSK-FE-SETUP-007.md](./tasks/TSK-FE-SETUP-007.md) |  |
| FE-SETUP-008 | Configurar TanStack Query | Pendente | FE-SETUP-001.6 | P1 | Frontend | [TSK-FE-SETUP-008.md](./tasks/TSK-FE-SETUP-008.md) |  |
| ARCH-FE-UI-STRUCT-001 | Definir organização interna de presentation/ui/ | Concluído | FE-SETUP-001.6 | P0 | Jules (Arquiteto) | [TSK-ARCH-FE-UI-STRUCT-001.md](./tasks/TSK-ARCH-FE-UI-STRUCT-001.md) |  |
| FE-SETUP-010 | Migrar globals.css para nova estrutura | Concluído | FE-SETUP-001.1 | P0 | Jules | [TSK-FE-SETUP-010.md](./tasks/TSK-FE-SETUP-010.md) |  |
| FE-LAYOUT-001| Implementar Root Layout do Router | Pendente | FE-SETUP-002, FE-SETUP-003, ARCH-FE-UI-STRUCT-001 | P0 | Frontend | [TSK-FE-LAYOUT-001.md](./tasks/TSK-FE-LAYOUT-001.md) |  |
| FE-LAYOUT-002| Implementar Layout Principal Autenticado | Pendente | FE-LAYOUT-001, FE-COMP-SIDEBAR-APP | P1 | Frontend | [TSK-FE-LAYOUT-002.md](./tasks/TSK-FE-LAYOUT-002.md) |  |
| FE-LAYOUT-003| Implementar Layout da Seção de Projeto | Pendente | FE-LAYOUT-002, FE-COMP-SIDEBAR-PROJ | P1 | Frontend | [TSK-FE-LAYOUT-003.md](./tasks/TSK-FE-LAYOUT-003.md) |  |
| FE-LAYOUT-004| Implementar Layout da Seção de Usuário | Pendente | FE-LAYOUT-002, FE-COMP-SIDEBAR-USER | P1 | Frontend | [TSK-FE-LAYOUT-004.md](./tasks/TSK-FE-LAYOUT-004.md) |  |
| FE-LAYOUT-005| Implementar Layout Público | Pendente | FE-LAYOUT-001 | P2 | Frontend | [TSK-FE-LAYOUT-005.md](./tasks/TSK-FE-LAYOUT-005.md) |  |
| FE-COMP-SIDEBAR-APP | Implementar AppSidebar | Pendente | FE-SETUP-002, FE-COMP-UI-008 | P1 | Frontend | [TSK-FE-COMP-SIDEBAR-APP.md](./tasks/TSK-FE-COMP-SIDEBAR-APP.md) | Deps FE-COMP-UI-* são Shadcn |
| FE-COMP-SIDEBAR-PROJ| Implementar ProjectSidebar | Pendente | FE-SETUP-002, FE-COMP-UI-008 | P1 | Frontend | [TSK-FE-COMP-SIDEBAR-PROJ.md](./tasks/TSK-FE-COMP-SIDEBAR-PROJ.md) | Deps FE-COMP-UI-* são Shadcn |
| FE-COMP-SIDEBAR-USER| Implementar UserSidebar | Pendente | FE-SETUP-002, FE-COMP-UI-008 | P1 | Frontend | [TSK-FE-COMP-SIDEBAR-USER.md](./tasks/TSK-FE-COMP-SIDEBAR-USER.md) | Deps FE-COMP-UI-* são Shadcn |
| FE-COMP-CHAT-INPUT| Implementar ChatInput | Pendente | FE-SETUP-002, FE-COMP-UI-001, FE-COMP-UI-004 | P1 | Frontend | [TSK-FE-COMP-CHAT-INPUT.md](./tasks/TSK-FE-COMP-CHAT-INPUT.md) | Deps FE-COMP-UI-* são Shadcn |
| FE-COMP-CHAT-MSG  | Implementar ChatMessage | Pendente | FE-COMP-MARKDOWN | P1 | Frontend | [TSK-FE-COMP-CHAT-MSG.md](./tasks/TSK-FE-COMP-CHAT-MSG.md) |  |
| FE-COMP-CHAT-THREAD| Implementar ChatThread | Pendente | FE-COMP-CHAT-INPUT, FE-COMP-CHAT-MSG | P1 | Frontend | [TSK-FE-COMP-CHAT-THREAD.md](./tasks/TSK-FE-COMP-CHAT-THREAD.md) |  |
| FE-COMP-DASH-ACTIVITY| Implementar ActivityListItem | Pendente | FE-SETUP-002, FE-COMP-UI-002 | P2 | Frontend | [TSK-FE-COMP-DASH-ACTIVITY.md](./tasks/TSK-FE-COMP-DASH-ACTIVITY.md) | Dep FE-COMP-UI-* é Shadcn |
| FE-COMP-DASH-USER | Implementar UserDashboard | Pendente | FE-COMP-DASH-ACTIVITY | P1 | Frontend | [TSK-FE-COMP-DASH-USER.md](./tasks/TSK-FE-COMP-DASH-USER.md) |  |
| FE-COMP-MARKDOWN  | Implementar MarkdownRenderer | Pendente | - | P1 | Frontend | [TSK-FE-COMP-MARKDOWN.md](./tasks/TSK-FE-COMP-MARKDOWN.md) |  |
| FE-COMP-MODE-TOGGLE| Implementar ModeToggle | Pendente | FE-SETUP-002, FE-COMP-UI-001, FE-COMP-UI-008 | P2 | Frontend | [TSK-FE-COMP-MODE-TOGGLE.md](./tasks/TSK-FE-COMP-MODE-TOGGLE.md) | Deps FE-COMP-UI-* são Shadcn |
| FE-COMP-ONBOARD-LLM| Implementar LLMConfigForm | Pendente | FE-SETUP-002, FE-SETUP-005 | P1 | Frontend | [TSK-FE-COMP-ONBOARD-LLM.md](./tasks/TSK-FE-COMP-ONBOARD-LLM.md) |  |
| FE-COMP-ONBOARD-USER| Implementar UserInfoForm | Pendente | FE-SETUP-002, FE-SETUP-005 | P1 | Frontend | [TSK-FE-COMP-ONBOARD-USER.md](./tasks/TSK-FE-COMP-ONBOARD-USER.md) |  |
| FE-COMP-ONBOARD-PERSONA| Implementar PersonaList | Pendente | FE-SETUP-002 | P1 | Frontend | [TSK-FE-COMP-ONBOARD-PERSONA.md](./tasks/TSK-FE-COMP-ONBOARD-PERSONA.md) |  |
| FE-COMP-PROJ-CARD | Implementar ProjectCard | Pendente | FE-SETUP-002 | P1 | Frontend | [TSK-FE-COMP-PROJ-CARD.md](./tasks/TSK-FE-COMP-PROJ-CARD.md) |  |
| FE-COMP-PROJ-DETAIL| Implementar ProjectDetailPage | Pendente | FE-SETUP-002, FE-COMP-PROJ-TABS | P1 | Frontend | [TSK-FE-COMP-PROJ-DETAIL.md](./tasks/TSK-FE-COMP-PROJ-DETAIL.md) | Requer subdivisão |
| FE-COMP-PROJ-LIST | Implementar ProjectListPage | Pendente | FE-SETUP-002, FE-COMP-PROJ-CARD | P1 | Frontend | [TSK-FE-COMP-PROJ-LIST.md](./tasks/TSK-FE-COMP-PROJ-LIST.md) |  |
| FE-COMP-PROJ-TABS | Implementar Abas de Detalhes do Projeto | Pendente | FE-COMP-PROJ-DETAIL | P1 | Frontend | [TSK-FE-COMP-PROJ-TABS.md](./tasks/TSK-FE-COMP-PROJ-TABS.md) |  |
| FE-COMP-TYPO      | Implementar componentes de Tipografia | Pendente | FE-SETUP-002 | P2 | Frontend | [TSK-FE-COMP-TYPO.md](./tasks/TSK-FE-COMP-TYPO.md) |  |
| FE-PAGE-HOME-PUB | Implementar Página Home Pública | Pendente | FE-LAYOUT-005 | P2 | Frontend | [TSK-FE-PAGE-HOME-PUB.md](./tasks/TSK-FE-PAGE-HOME-PUB.md) |  |
| FE-PAGE-ONBOARD  | Implementar Página de Onboarding | Pendente | FE-LAYOUT-005, FE-COMP-ONBOARD-USER, FE-COMP-ONBOARD-LLM, FE-COMP-ONBOARD-PERSONA | P0 | Frontend | [TSK-FE-PAGE-ONBOARD.md](./tasks/TSK-FE-PAGE-ONBOARD.md) | Requer subdivisão |
| FE-PAGE-PROJ-LIST| Implementar Página de Listagem de Projetos | Pendente | FE-LAYOUT-003, FE-COMP-PROJ-LIST | P1 | Frontend | [TSK-FE-PAGE-PROJ-LIST.md](./tasks/TSK-FE-PAGE-PROJ-LIST.md) |  |
| FE-PAGE-PROJ-DETAIL| Implementar Página de Detalhes do Projeto | Pendente | FE-LAYOUT-003, FE-COMP-PROJ-DETAIL | P1 | Frontend | [TSK-FE-PAGE-PROJ-DETAIL.md](./tasks/TSK-FE-PAGE-PROJ-DETAIL.md) |  |
| FE-PAGE-USER-DASH| Implementar Página de Dashboard do Usuário | Pendente | FE-LAYOUT-004, FE-COMP-DASH-USER | P1 | Frontend | [TSK-FE-PAGE-USER-DASH.md](./tasks/TSK-FE-PAGE-USER-DASH.md) |  |
| FE-PAGE-USER-DM  | Implementar Página de Mensagens Diretas | Pendente | FE-LAYOUT-004, FE-COMP-CHAT-THREAD | P1 | Frontend | [TSK-FE-PAGE-USER-DM.md](./tasks/TSK-FE-PAGE-USER-DM.md) |  |
| FE-PAGE-USER-GUIDES| Implementar Página de Guias do Usuário | Pendente | FE-LAYOUT-004 | P2 | Frontend | [TSK-FE-PAGE-USER-GUIDES.md](./tasks/TSK-FE-PAGE-USER-GUIDES.md) |  |
| FE-PAGE-ROOT-INDEX| Implementar index.tsx da raiz das páginas | Pendente | FE-SETUP-003 | P1 | Frontend | [TSK-FE-PAGE-ROOT-INDEX.md](./tasks/TSK-FE-PAGE-ROOT-INDEX.md) |  |
| FE-FEAT-PROJ-LIST| Implementar lógica de exibição da Lista de Projetos | Pendente | FE-PAGE-PROJ-LIST, FE-SETUP-008 | P1 | Frontend | [TSK-FE-FEAT-PROJ-LIST.md](./tasks/TSK-FE-FEAT-PROJ-LIST.md) | |
| FE-FEAT-PROJ-CREATE| Implementar fluxo de Criação de Projeto | Pendente | FE-PAGE-PROJ-LIST, FE-SETUP-002, FE-IPC-PROJ-CREATE | P1 | Frontend | [TSK-FE-FEAT-PROJ-CREATE.md](./tasks/TSK-FE-FEAT-PROJ-CREATE.md) | |
| FE-FEAT-ONBOARD| Implementar lógica de submissão do Onboarding | Pendente | FE-PAGE-ONBOARD, FE-IPC-ONBOARD | P0 | Frontend | [TSK-FE-FEAT-ONBOARD.md](./tasks/TSK-FE-FEAT-ONBOARD.md) | |
| FE-FEAT-CHAT   | Implementar funcionalidade de Chat | Pendente | FE-PAGE-USER-DM, FE-IPC-CHAT | P0 | Frontend | [TSK-FE-FEAT-CHAT.md](./tasks/TSK-FE-FEAT-CHAT.md) | Requer subdivisão |
| FE-FEAT-USER-PROFILE| Implementar gerenciamento de Perfil de Usuário | Pendente | FE-PAGE-USER-DASH | P2 | Frontend | [TSK-FE-FEAT-USER-PROFILE.md](./tasks/TSK-FE-FEAT-USER-PROFILE.md) | |
| FE-FEAT-LLM-CONFIG| Implementar gerenciamento de Configurações LLM | Pendente | FE-SETUP-008 | P2 | Frontend | [TSK-FE-FEAT-LLM-CONFIG.md](./tasks/TSK-FE-FEAT-LLM-CONFIG.md) | |
| FE-FEAT-CMD-PALETTE| Definir e implementar ações do Command Palette | Pendente | FE-SETUP-002 | P2 | Frontend | [TSK-FE-FEAT-CMD-PALETTE.md](./tasks/TSK-FE-FEAT-CMD-PALETTE.md) | |
| FE-FEAT-SIDEBAR-DYNAMIC| Implementar carregamento dinâmico de dados para sidebars | Pendente | FE-COMP-SIDEBAR-PROJ, FE-COMP-SIDEBAR-USER, FE-SETUP-008 | P1 | Frontend | [TSK-FE-FEAT-SIDEBAR-DYNAMIC.md](./tasks/TSK-FE-FEAT-SIDEBAR-DYNAMIC.md) | |
| FE-FEAT-TODO-ACTIONS| Implementar ações TODO dos componentes UI | Pendente | Várias FE-COMP-* | P2 | Frontend | [TSK-FE-FEAT-TODO-ACTIONS.md](./tasks/TSK-FE-FEAT-TODO-ACTIONS.md) | Requer subdivisão |
| FE-FEAT-DOC-FEATURES| Implementar UI para features documentadas | Pendente | FE-LAYOUT-001+ | P2 | Frontend | [TSK-FE-FEAT-DOC-FEATURES.md](./tasks/TSK-FE-FEAT-DOC-FEATURES.md) | Requer subdivisão e design |
| FE-IPC-CORE-ABSTR| Implementar abstração useCore() para IPC | Pendente | FE-SETUP-001 | P0 | Frontend | [TSK-FE-IPC-CORE-ABSTR.md](./tasks/TSK-FE-IPC-CORE-ABSTR.md) | |
| FE-IPC-PROJ-LIST| Definir/implementar IPC query:get-projects | Pendente | FE-IPC-CORE-ABSTR | P1 | Frontend/Backend | [TSK-FE-IPC-PROJ-LIST.md](./tasks/TSK-FE-IPC-PROJ-LIST.md) | |
| FE-IPC-PROJ-CREATE| Definir/implementar IPC usecase:create-project | Pendente | FE-IPC-CORE-ABSTR | P1 | Frontend/Backend | [TSK-FE-IPC-PROJ-CREATE.md](./tasks/TSK-FE-IPC-PROJ-CREATE.md) | |
| FE-IPC-ONBOARD | Definir/implementar IPCs para Onboarding | Pendente | FE-IPC-CORE-ABSTR | P0 | Frontend/Backend | [TSK-FE-IPC-ONBOARD.md](./tasks/TSK-FE-IPC-ONBOARD.md) | |
| FE-IPC-CHAT    | Definir/implementar IPCs para Chat | Pendente | FE-IPC-CORE-ABSTR | P0 | Frontend/Backend | [TSK-FE-IPC-CHAT.md](./tasks/TSK-FE-IPC-CHAT.md) | |

---
## Tarefas Pendentes de Migração (Formato Antigo)

| ID da Tarefa | Descrição da Tarefa                                                                                                | Status        | Dependências (IDs) | Complexidade (1-5) | Responsável | Branch Git                                 | Commit da Conclusão (Link) | Notas/Decisões                                                                                                                               |
|--------------|--------------------------------------------------------------------------------------------------------------------|---------------|--------------------|--------------------|-------------|--------------------------------------------|----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| **SUB-FASE 5.C: CAMADA DE INFRAESTRUTURA (`src_refactored/infrastructure/`)**                                                      |               |                    |                    |                    |             |                                            |                            |                                                                                                                                              |
| ...          | (Repositórios Drizzle, Adaptadores de Tools, LLM, Fila, Worker Pool, IOC InversifyJS, Config)                       | Pendente      | ...                | ...                | Jules       |                                            |                            | Detalhar conforme progresso.                                                                                                                 |
| ---          | ---                                                                                                                | ---           | ---                | ---                | ---         | ---                                        | ---                        | ---                                                                                                                                          |
| **SUB-FASE 5.D: CAMADA DE APRESENTAÇÃO (UI e Electron)**                                                                           |               |                    |                    |                    |             |                                            |                            |                                                                                                                                              |
| ...          | (Electron Main/Preload, Handlers IPC, Componentes React UI, Páginas, Stores, Hooks, Serviços IPC)                  | Pendente      | ...                | ...                | Jules       |                                            |                            | Detalhar conforme progresso.                                                                                                                 |
| ---          | ---                                                                                                                | ---           | ---                | ---                | ---         | ---                                        | ---                        | ---                                                                                                                                          |
| **SUB-FASE 5.E: TESTES**                                                                                                           |               |                    |                    |                    |             |                                            |                            |                                                                                                                                              |
| ...          | (Testes Unitários, de Integração, E2E)                                                                             | Pendente      | ...                | ...                | Jules       |                                            |                            | Detalhar conforme progresso.                                                                                                                 |
| ---          | ---                                                                                                                | ---           | ---                | ---                | ---         | ---                                        | ---                        | ---                                                                                                                                          |
| **SUB-FASE 5.F: REMOÇÃO DE CÓDIGO LEGADO E MIGRAÇÃO**                                                                              |               |                    |                    |                    |             |                                            |                            |                                                                                                                                              |
| ...          | (Análise de `src/`, `src2/`, Exclusão, Movimentação de `src_refactored/` para `src/`, Ajustes finais)               | Pendente      | Todas anteriores   | ...                | Jules       |                                            |                            |                                                                                                                                              |
|              | **Finalização (Conforme Fase 5 do `tasks.md` original)**                                                           |               |                    |                    |             |                                            |                            |                                                                                                                                              |
| FE-DOC-ARCH    | Documentar arquitetura do novo frontend, componentes e diretrizes de desenvolvimento.                                | Pendente      | Todas FE-*         | 3                  | Frontend    | docs/fe-architecture                       |                            |                                                                                                                                              |
| FE-DOC-USER    | Criar ou atualizar guias de usuário relevantes para a nova UI.                                                       | Pendente      | Todas FE-PAGE-*    | 2                  | Frontend    | docs/fe-user-guide                         |                            |                                                                                                                                              |
| FE-I18N-FINALIZE| Garantir que todas as traduções i18n (LinguiJS) estejam implementadas e corretas.                                    | Pendente      | Todas FE-PAGE-*, FE-COMP-* | 3    | Frontend    | feat/fe-i18n-finalize                      |                            |                                                                                                                                              |
| FE-TEST-UNIT   | Escrever testes unitários para componentes e hooks críticos.                                                         | Pendente      | Todas FE-COMP-*, FE-FEAT-* | 4    | Frontend    | test/fe-unit                               |                            | (Requer subdivisão)                                                                                                                        |
| FE-TEST-INTEG  | Escrever testes de integração para fluxos de usuário chave.                                                          | Pendente      | Todas FE-PAGE-*, FE-FEAT-* | 4    | Frontend    | test/fe-integration                        |                            | (Requer subdivisão)                                                                                                                        |
| FE-CORE-IMPACT-REVIEW | Revisar todos os `Core Impact` identificados e garantir que tarefas correspondentes foram criadas para o backend. | Pendente    | Todas FE-*         | 2                  | Arquiteto   | N/A                                        |                            | Esta é uma tarefa de revisão/coordenação.                                                                                                    |

[end of .jules/TASKS.md]

[start of .jules/templates/TASK_DETAIL_TEMPLATE.md]
# Tarefa: [ID_DA_TAREFA] - [TÍTULO_BREVE_DA_TAREFA]

**ID da Tarefa:** `[ID_DA_TAREFA]`
**Título Breve:** `[TÍTULO_BREVE_DA_TAREFA]`
**Descrição Completa:**
`[DESCRIÇÃO_COMPLETA_DA_TAREFA]`

---

**Status:** `[STATUS_ATUAL]` (Pendente, Em Andamento, Concluído, Bloqueado, Revisão, Cancelado)
**Dependências (IDs):** `[LISTA_DE_IDS_DE_DEPENDENCIA]` (ex: `APP-SVC-001, CONFIG-002`)
**Complexidade (1-5):** `[NÍVEL_DE_COMPLEXIDADE]`
**Prioridade (P0-P4):** `[NÍVEL_DE_PRIORIDADE]`
**Responsável:** `[NOME_DO_RESPONSÁVEL]`
**Branch Git Proposta:** `[BRANCH_GIT_SUGERIDA]`
**Commit da Conclusão (Link):** `[LINK_PARA_COMMIT_DE_CONCLUSÃO]` (Preencher após conclusão)

---

## Critérios de Aceitação
- `[CRITÉRIO_1]`
- `[CRITÉRIO_2]`
- ...

---

## Notas/Decisões de Design
- `[NOTA_OU_DECISÃO_1]`
- `[NOTA_OU_DECISÃO_2]`
- ...

---

## Comentários
- `[COMENTÁRIO_INICIAL_OU_DATA_DE_CRIAÇÃO]`
- `(YYYY-MM-DD por @Autor): [Comentário adicional]`

---

## Histórico de Modificações da Tarefa (Opcional)
- `(YYYY-MM-DD por @Autor): [Descrição da modificação]`

[end of .jules/templates/TASK_DETAIL_TEMPLATE.md]

[end of .jules/TASKS.md]

[start of .jules/templates/TASK_INDEX_TEMPLATE.md]
# Tabela Principal de Tarefas

**Status:** Pendente, Em Andamento, Concluído, Bloqueado, Revisão, Cancelado
**Prioridade (P0-P4):** P0 (Crítica), P1 (Alta), P2 (Média), P3 (Baixa), P4 (Muito Baixa)

| ID da Tarefa | Título Breve da Tarefa | Status | Dependências (IDs) | Prioridade | Responsável | Link para Detalhes | Notas Breves |
|--------------|------------------------|--------|--------------------|------------|-------------|--------------------|--------------|
|              |                        |        |                    |            |             |                    |              |

[end of .jules/templates/TASK_INDEX_TEMPLATE.md]
