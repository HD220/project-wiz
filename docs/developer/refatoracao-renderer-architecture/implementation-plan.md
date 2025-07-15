# Refatoração e Reorganização do Renderer - Plano de Implementação

## Estratégia: Migração Arquivo por Arquivo

Este plano implementa a **estratégia arquivo por arquivo** definida no brainstorm, onde cada arquivo é completamente refatorado, aplicando Object Calisthenics, movido para a nova estrutura de domínios e removido após validação.

## Metodologia de Migração

### Processo por Arquivo

Para cada arquivo identificado:

1. **🔍 Análise** - Identificar violações e complexidade
2. **🛠️ Refatoração** - Aplicar Object Calisthenics completamente
3. **📦 Migração** - Mover para nova estrutura de domínios
4. **✅ Validação** - Testar funcionalidade
5. **🔥 Remoção** - Deletar arquivo original após aprovação

### Critérios de Aceite por Arquivo

- ✅ Localizado na nova estrutura de domínios
- ✅ ≤50 linhas por componente/classe
- ✅ ≤10 linhas por método/função
- ✅ ≤2 variáveis de instância por classe
- ✅ Zero declarações `else`
- ✅ Funcionalidade preservada 100%
- ✅ TypeScript compilation sem erros

## Inventário Completo de Arquivos

### 📊 Resumo Executivo

**Total de Arquivos:** 139 arquivos TypeScript/TSX  
**Prioridade 1 (Críticos):** 15 arquivos  
**Prioridade 2 (Moderados):** 23 arquivos  
**Prioridade 3 (Simples):** 45 arquivos  
**Prioridade 4 (Manutenção):** 56 arquivos  

## Domínio: USERS

### 🔴 Prioridade 1 - Críticos

#### `features/direct-messages/components/conversation-view.tsx`
- **Linhas:** 249
- **Violações:** Componente gigante, múltiplas responsabilidades
- **Destino:** `domains/users/components/conversation-view.tsx`
- **Ação:** Dividir em 4-5 componentes menores
- **Status:** ❌ Pendente
- **Estimativa:** 2-3 dias

**Checklist:**
- [ ] Analisar responsabilidades do componente
- [ ] Criar `ConversationHeader` (≤50 linhas)
- [ ] Criar `MessageList` (≤50 linhas)
- [ ] Criar `MessageInput` (≤50 linhas)
- [ ] Criar `TypingIndicator` (≤50 linhas)
- [ ] Extrair hooks `useAutoScroll`, `useMessageSend`
- [ ] Aplicar Object Calisthenics em todos
- [ ] Testar funcionalidade completa
- [ ] Validar performance
- [ ] Remover arquivo original

#### `features/direct-messages/components/conversation-list.tsx`
- **Linhas:** 128
- **Violações:** Lógica complexa, múltiplos estados
- **Destino:** `domains/users/components/conversation-list.tsx`
- **Ação:** Extrair hooks personalizados
- **Status:** ❌ Pendente
- **Estimativa:** 1-2 dias

**Checklist:**
- [ ] Identificar estados complexos
- [ ] Extrair `useConversationFilter` hook
- [ ] Extrair `useConversationSelection` hook
- [ ] Simplificar componente principal (≤50 linhas)
- [ ] Aplicar Object Calisthenics
- [ ] Testar filtros e seleção
- [ ] Validar performance
- [ ] Remover arquivo original

#### `features/direct-messages/hooks/use-direct-message-chat.hook.ts`
- **Linhas:** 171
- **Violações:** Hook muito complexo
- **Destino:** `domains/users/hooks/use-message-chat.hook.ts`
- **Ação:** Dividir em hooks específicos
- **Status:** ❌ Pendente
- **Estimativa:** 1-2 dias

**Checklist:**
- [ ] Identificar responsabilidades do hook
- [ ] Criar `useMessageSend` hook (≤50 linhas)
- [ ] Criar `useMessageLoad` hook (≤50 linhas)
- [ ] Criar `useMessageStatus` hook (≤50 linhas)
- [ ] Aplicar Object Calisthenics em todos
- [ ] Testar cada hook isoladamente
- [ ] Validar integração
- [ ] Remover arquivo original

#### `features/user-management/components/user-sidebar.tsx`
- **Linhas:** 127
- **Violações:** Componente complexo
- **Destino:** `domains/users/components/user-sidebar.tsx`
- **Ação:** Extrair subcomponentes
- **Status:** ❌ Pendente
- **Estimativa:** 1 dia

**Checklist:**
- [ ] Identificar seções do sidebar
- [ ] Criar `UserProfile` component (≤50 linhas)
- [ ] Criar `UserNavigation` component (≤50 linhas)
- [ ] Criar `UserSettings` component (≤50 linhas)
- [ ] Aplicar Object Calisthenics
- [ ] Testar navegação
- [ ] Validar responsividade
- [ ] Remover arquivo original

### 🟡 Prioridade 2 - Moderados

#### `features/direct-messages/stores/message.store.ts`
- **Linhas:** 101
- **Violações:** Store com muitas responsabilidades
- **Destino:** `domains/users/stores/message.store.ts`
- **Ação:** Aplicar Object Calisthenics
- **Status:** ❌ Pendente
- **Estimativa:** 0.5-1 dia

**Checklist:**
- [ ] Identificar responsabilidades do store
- [ ] Dividir em ≤2 variáveis de instância
- [ ] Métodos ≤10 linhas cada
- [ ] Extrair lógica complexa para utils
- [ ] Aplicar Object Calisthenics
- [ ] Testar operações CRUD
- [ ] Validar performance
- [ ] Remover arquivo original

#### `features/direct-messages/stores/conversation.store.ts`
- **Linhas:** 99
- **Violações:** Métodos grandes
- **Destino:** `domains/users/stores/conversation.store.ts`
- **Ação:** Dividir responsabilidades
- **Status:** ❌ Pendente
- **Estimativa:** 0.5-1 dia

**Checklist:**
- [ ] Identificar métodos grandes
- [ ] Dividir métodos ≤10 linhas
- [ ] Extrair lógica para functions
- [ ] Aplicar Object Calisthenics
- [ ] Testar operações de conversação
- [ ] Validar sincronização
- [ ] Remover arquivo original

#### `features/user-management/stores/user.store.ts`
- **Linhas:** 120
- **Violações:** Store complexo
- **Destino:** `domains/users/stores/user.store.ts`
- **Ação:** Simplificar métodos
- **Status:** ❌ Pendente
- **Estimativa:** 0.5-1 dia

**Checklist:**
- [ ] Analisar complexidade do store
- [ ] Dividir em ≤2 variáveis de instância
- [ ] Métodos ≤10 linhas cada
- [ ] Extrair validações para utils
- [ ] Aplicar Object Calisthenics
- [ ] Testar autenticação
- [ ] Validar persistência
- [ ] Remover arquivo original

### 🟢 Prioridade 3 - Simples

#### `features/direct-messages/hooks/use-conversations.hook.ts`
- **Linhas:** 71
- **Destino:** `domains/users/hooks/use-conversations.hook.ts`
- **Ação:** Migração direta
- **Status:** ❌ Pendente
- **Estimativa:** 0.5 dia

**Checklist:**
- [ ] Mover para nova estrutura
- [ ] Verificar Object Calisthenics
- [ ] Atualizar imports
- [ ] Testar funcionalidade
- [ ] Remover arquivo original

#### `features/direct-messages/hooks/use-messages.hook.ts`
- **Linhas:** 51
- **Destino:** `domains/users/hooks/use-messages.hook.ts`
- **Ação:** Migração direta
- **Status:** ❌ Pendente
- **Estimativa:** 0.5 dia

**Checklist:**
- [ ] Mover para nova estrutura
- [ ] Verificar Object Calisthenics
- [ ] Atualizar imports
- [ ] Testar funcionalidade
- [ ] Remover arquivo original

#### `features/direct-messages/hooks/use-agent-chat.hook.ts`
- **Linhas:** 65
- **Destino:** `domains/users/hooks/use-agent-chat.hook.ts`
- **Ação:** Migração direta
- **Status:** ❌ Pendente
- **Estimativa:** 0.5 dia

**Checklist:**
- [ ] Mover para nova estrutura
- [ ] Verificar Object Calisthenics
- [ ] Atualizar imports
- [ ] Testar funcionalidade
- [ ] Remover arquivo original

#### `features/user-management/components/user-area.tsx`
- **Linhas:** 28
- **Destino:** `domains/users/components/user-area.tsx`
- **Ação:** Migração direta
- **Status:** ❌ Pendente
- **Estimativa:** 0.5 dia

**Checklist:**
- [ ] Mover para nova estrutura
- [ ] Verificar Object Calisthenics (já OK)
- [ ] Atualizar imports
- [ ] Testar funcionalidade
- [ ] Remover arquivo original

#### `features/user-management/hooks/use-user.hook.ts`
- **Linhas:** 44
- **Destino:** `domains/users/hooks/use-user.hook.ts`
- **Ação:** Migração direta
- **Status:** ❌ Pendente
- **Estimativa:** 0.5 dia

**Checklist:**
- [ ] Mover para nova estrutura
- [ ] Verificar Object Calisthenics (já OK)
- [ ] Atualizar imports
- [ ] Testar funcionalidade
- [ ] Remover arquivo original

## Domínio: PROJECTS

### 🔴 Prioridade 1 - Críticos

#### `features/project-management/components/add-agent-modal.tsx`
- **Linhas:** 343
- **Violações:** Componente gigante, formulário complexo
- **Destino:** `domains/projects/components/add-agent-modal.tsx`
- **Ação:** Dividir em 3-4 componentes
- **Status:** ❌ Pendente
- **Estimativa:** 2-3 dias

**Checklist:**
- [ ] Identificar seções do modal
- [ ] Criar `AgentSelectionForm` (≤50 linhas)
- [ ] Criar `AgentConfigurationForm` (≤50 linhas)
- [ ] Criar `AgentPreview` (≤50 linhas)
- [ ] Criar `AddAgentModal` container (≤50 linhas)
- [ ] Extrair hooks `useAgentSelection`, `useAgentValidation`
- [ ] Aplicar Object Calisthenics em todos
- [ ] Testar fluxo completo
- [ ] Validar UX
- [ ] Remover arquivo original

#### `features/project-management/components/agents-sidebar.tsx`
- **Linhas:** 220
- **Violações:** Lógica complexa de renderização
- **Destino:** `domains/projects/components/agents-sidebar.tsx`
- **Ação:** Extrair componentes de lista
- **Status:** ❌ Pendente
- **Estimativa:** 1-2 dias

**Checklist:**
- [ ] Identificar seções do sidebar
- [ ] Criar `AgentList` component (≤50 linhas)
- [ ] Criar `AgentItem` component (≤50 linhas)
- [ ] Criar `AgentFilters` component (≤50 linhas)
- [ ] Criar `AgentsSidebar` container (≤50 linhas)
- [ ] Extrair hooks `useAgentFilters`
- [ ] Aplicar Object Calisthenics
- [ ] Testar filtros
- [ ] Validar performance
- [ ] Remover arquivo original

#### `features/project-management/components/create-channel-modal.tsx`
- **Linhas:** 203
- **Violações:** Modal complexo
- **Destino:** `domains/projects/components/create-channel-modal.tsx`
- **Ação:** Separar form e validação
- **Status:** ❌ Pendente
- **Estimativa:** 1-2 dias

**Checklist:**
- [ ] Identificar responsabilidades
- [ ] Criar `ChannelForm` component (≤50 linhas)
- [ ] Criar `ChannelValidation` component (≤50 linhas)
- [ ] Criar `CreateChannelModal` container (≤50 linhas)
- [ ] Extrair hooks `useChannelForm`, `useChannelValidation`
- [ ] Aplicar Object Calisthenics
- [ ] Testar criação
- [ ] Validar UX
- [ ] Remover arquivo original

#### `features/project-management/components/project-navigation.tsx`
- **Linhas:** 177
- **Violações:** Navegação complexa
- **Destino:** `domains/projects/components/project-navigation.tsx`
- **Ação:** Extrair subcomponentes
- **Status:** ❌ Pendente
- **Estimativa:** 1-2 dias

**Checklist:**
- [ ] Identificar seções de navegação
- [ ] Criar `ProjectTabs` component (≤50 linhas)
- [ ] Criar `ProjectBreadcrumb` component (≤50 linhas)
- [ ] Criar `ProjectActions` component (≤50 linhas)
- [ ] Criar `ProjectNavigation` container (≤50 linhas)
- [ ] Extrair hooks `useProjectNavigation`
- [ ] Aplicar Object Calisthenics
- [ ] Testar navegação
- [ ] Validar acessibilidade
- [ ] Remover arquivo original

#### `features/development-tools/components/file-explorer.tsx`
- **Linhas:** 401
- **Violações:** Componente gigante
- **Destino:** `domains/shared/components/file-explorer.tsx`
- **Ação:** Dividir em tree + item components
- **Status:** ❌ Pendente
- **Estimativa:** 2-3 dias

**Checklist:**
- [ ] Identificar estrutura de árvore
- [ ] Criar `FileTree` component (≤50 linhas)
- [ ] Criar `FileItem` component (≤50 linhas)
- [ ] Criar `FileActions` component (≤50 linhas)
- [ ] Criar `FileExplorer` container (≤50 linhas)
- [ ] Extrair hooks `useFileTree`, `useFileActions`
- [ ] Aplicar Object Calisthenics
- [ ] Testar navegação
- [ ] Validar performance
- [ ] Remover arquivo original

#### `features/development-tools/components/terminal-panel.tsx`
- **Linhas:** 342
- **Violações:** Painel complexo
- **Destino:** `domains/shared/components/terminal-panel.tsx`
- **Ação:** Extrair terminal logic
- **Status:** ❌ Pendente
- **Estimativa:** 2-3 dias

**Checklist:**
- [ ] Identificar responsabilidades do terminal
- [ ] Criar `TerminalOutput` component (≤50 linhas)
- [ ] Criar `TerminalInput` component (≤50 linhas)
- [ ] Criar `TerminalHistory` component (≤50 linhas)
- [ ] Criar `TerminalPanel` container (≤50 linhas)
- [ ] Extrair hooks `useTerminal`, `useTerminalHistory`
- [ ] Aplicar Object Calisthenics
- [ ] Testar comandos
- [ ] Validar performance
- [ ] Remover arquivo original

#### `features/channel-messaging/hooks/use-channel-chat.hook.ts`
- **Linhas:** 383
- **Violações:** Hook gigante
- **Destino:** `domains/projects/hooks/use-channel-chat.hook.ts`
- **Ação:** Dividir em hooks específicos
- **Status:** ❌ Pendente
- **Estimativa:** 2-3 dias

**Checklist:**
- [ ] Identificar responsabilidades do hook
- [ ] Criar `useChannelMessages` hook (≤50 linhas)
- [ ] Criar `useChannelSend` hook (≤50 linhas)
- [ ] Criar `useChannelStatus` hook (≤50 linhas)
- [ ] Criar `useChannelTyping` hook (≤50 linhas)
- [ ] Aplicar Object Calisthenics
- [ ] Testar cada hook
- [ ] Validar integração
- [ ] Remover arquivo original

#### `features/channel-messaging/stores/channel-message.store.ts`
- **Linhas:** 343
- **Violações:** Store complexo
- **Destino:** `domains/projects/stores/channel-message.store.ts`
- **Ação:** Aplicar Object Calisthenics
- **Status:** ❌ Pendente
- **Estimativa:** 1-2 dias

**Checklist:**
- [ ] Identificar responsabilidades do store
- [ ] Dividir em ≤2 variáveis de instância
- [ ] Métodos ≤10 linhas cada
- [ ] Extrair lógica complexa para utils
- [ ] Aplicar Object Calisthenics
- [ ] Testar mensagens
- [ ] Validar performance
- [ ] Remover arquivo original

#### `features/communication/stores/channel.store.ts`
- **Linhas:** 303
- **Violações:** Store complexo
- **Destino:** `domains/projects/stores/channel.store.ts`
- **Ação:** Simplificar métodos
- **Status:** ❌ Pendente
- **Estimativa:** 1-2 dias

**Checklist:**
- [ ] Identificar métodos complexos
- [ ] Dividir em ≤2 variáveis de instância
- [ ] Métodos ≤10 linhas cada
- [ ] Extrair validações para utils
- [ ] Aplicar Object Calisthenics
- [ ] Testar canais
- [ ] Validar sincronização
- [ ] Remover arquivo original

#### `features/task-management/components/kanban-board.tsx`
- **Linhas:** 252
- **Violações:** Board complexo
- **Destino:** `domains/projects/components/kanban-board.tsx`
- **Ação:** Dividir em card + column
- **Status:** ❌ Pendente
- **Estimativa:** 1-2 dias

**Checklist:**
- [ ] Identificar estrutura do board
- [ ] Criar `KanbanColumn` component (≤50 linhas)
- [ ] Criar `KanbanCard` component (≤50 linhas)
- [ ] Criar `KanbanFilters` component (≤50 linhas)
- [ ] Criar `KanbanBoard` container (≤50 linhas)
- [ ] Extrair hooks `useKanbanDrag`, `useKanbanFilters`
- [ ] Aplicar Object Calisthenics
- [ ] Testar drag & drop
- [ ] Validar performance
- [ ] Remover arquivo original

### 🟡 Prioridade 2 - Moderados

#### `features/project-management/components/create-project-form.tsx`
- **Linhas:** 137
- **Violações:** Formulário longo
- **Destino:** `domains/projects/components/create-project-form.tsx`
- **Ação:** Aplicar Object Calisthenics
- **Status:** ❌ Pendente
- **Estimativa:** 1 dia

**Checklist:**
- [ ] Identificar seções do formulário
- [ ] Dividir em ≤50 linhas
- [ ] Métodos ≤10 linhas cada
- [ ] Extrair validações para utils
- [ ] Aplicar Object Calisthenics
- [ ] Testar validação
- [ ] Validar UX
- [ ] Remover arquivo original

#### `features/project-management/components/create-project-modal.tsx`
- **Linhas:** 132
- **Violações:** Modal complexo
- **Destino:** `domains/projects/components/create-project-modal.tsx`
- **Ação:** Dividir responsabilidades
- **Status:** ❌ Pendente
- **Estimativa:** 1 dia

**Checklist:**
- [ ] Identificar responsabilidades
- [ ] Dividir em ≤50 linhas
- [ ] Métodos ≤10 linhas cada
- [ ] Extrair lógica para hooks
- [ ] Aplicar Object Calisthenics
- [ ] Testar modal
- [ ] Validar UX
- [ ] Remover arquivo original

#### `features/project-management/stores/project.store.ts`
- **Linhas:** 131
- **Violações:** Store com muitos métodos
- **Destino:** `domains/projects/stores/project.store.ts`
- **Ação:** Simplificar interface
- **Status:** ❌ Pendente
- **Estimativa:** 1 dia

**Checklist:**
- [ ] Identificar métodos complexos
- [ ] Dividir em ≤2 variáveis de instância
- [ ] Métodos ≤10 linhas cada
- [ ] Extrair lógica para utils
- [ ] Aplicar Object Calisthenics
- [ ] Testar operações
- [ ] Validar performance
- [ ] Remover arquivo original

### 🟢 Prioridade 3 - Simples

#### `features/project-management/hooks/use-projects.hook.ts`
- **Linhas:** 70
- **Destino:** `domains/projects/hooks/use-projects.hook.ts`
- **Ação:** Migração direta
- **Status:** ❌ Pendente
- **Estimativa:** 0.5 dia

**Checklist:**
- [ ] Mover para nova estrutura
- [ ] Verificar Object Calisthenics
- [ ] Atualizar imports
- [ ] Testar funcionalidade
- [ ] Remover arquivo original

#### Demais arquivos simples (≤70 linhas) seguem o mesmo padrão de checklist acima.

## Domínio: AGENTS

### 🔴 Prioridade 1 - Críticos

#### `features/agent-management/components/agent-dashboard.tsx`
- **Linhas:** 444
- **Violações:** Componente gigante, múltiplas views
- **Destino:** `domains/agents/components/agent-dashboard.tsx`
- **Ação:** Dividir em 6-8 componentes menores
- **Status:** ❌ Pendente
- **Estimativa:** 3-4 dias

**Checklist:**
- [ ] Identificar seções do dashboard
- [ ] Criar `AgentStats` component (≤50 linhas)
- [ ] Criar `AgentTasks` component (≤50 linhas)
- [ ] Criar `AgentLogs` component (≤50 linhas)
- [ ] Criar `AgentControls` component (≤50 linhas)
- [ ] Criar `AgentSettings` component (≤50 linhas)
- [ ] Criar `AgentDashboard` container (≤50 linhas)
- [ ] Extrair hooks `useAgentStats`, `useAgentTasks`, `useAgentLogs`
- [ ] Aplicar Object Calisthenics em todos
- [ ] Testar todas as views
- [ ] Validar performance
- [ ] Remover arquivo original

### 🟢 Prioridade 3 - Simples

#### `features/agent-management/hooks/use-agents.hook.ts`
- **Linhas:** 125
- **Destino:** `domains/agents/hooks/use-agents.hook.ts`
- **Ação:** Migração direta
- **Status:** ❌ Pendente
- **Estimativa:** 0.5 dia

**Checklist:**
- [ ] Mover para nova estrutura
- [ ] Verificar Object Calisthenics
- [ ] Atualizar imports
- [ ] Testar funcionalidade
- [ ] Remover arquivo original

## Domínio: LLM

### 🟡 Prioridade 2 - Moderados

#### `features/llm-provider-management/stores/llm-provider.store.ts`
- **Linhas:** 220
- **Violações:** Store muito complexo
- **Destino:** `domains/llm/stores/llm-provider.store.ts`
- **Ação:** Aplicar Object Calisthenics
- **Status:** ❌ Pendente
- **Estimativa:** 1-2 dias

**Checklist:**
- [ ] Identificar responsabilidades do store
- [ ] Dividir em ≤2 variáveis de instância
- [ ] Métodos ≤10 linhas cada
- [ ] Extrair validações para utils
- [ ] Aplicar Object Calisthenics
- [ ] Testar providers
- [ ] Validar configuração
- [ ] Remover arquivo original

#### `features/llm-provider-management/components/llm-provider-form-modal.tsx`
- **Linhas:** 213
- **Violações:** Modal com formulário complexo
- **Destino:** `domains/llm/components/llm-provider-form-modal.tsx`
- **Ação:** Dividir form e modal
- **Status:** ❌ Pendente
- **Estimativa:** 1-2 dias

**Checklist:**
- [ ] Identificar responsabilidades
- [ ] Criar `LlmProviderForm` component (≤50 linhas)
- [ ] Criar `LlmProviderModal` component (≤50 linhas)
- [ ] Criar `LlmProviderValidation` component (≤50 linhas)
- [ ] Extrair hooks `useLlmProviderForm`
- [ ] Aplicar Object Calisthenics
- [ ] Testar formulário
- [ ] Validar UX
- [ ] Remover arquivo original

### 🟢 Prioridade 3 - Simples

#### `features/llm-provider-management/components/llm-provider-management.tsx`
- **Linhas:** 112
- **Destino:** `domains/llm/components/llm-provider-management.tsx`
- **Ação:** Migração direta
- **Status:** ❌ Pendente
- **Estimativa:** 0.5 dia

**Checklist:**
- [ ] Mover para nova estrutura
- [ ] Verificar Object Calisthenics
- [ ] Atualizar imports
- [ ] Testar funcionalidade
- [ ] Remover arquivo original

#### `features/llm-provider-management/hooks/use-llm-provider.hook.ts`
- **Linhas:** 91
- **Destino:** `domains/llm/hooks/use-llm-provider.hook.ts`
- **Ação:** Migração direta
- **Status:** ❌ Pendente
- **Estimativa:** 0.5 dia

**Checklist:**
- [ ] Mover para nova estrutura
- [ ] Verificar Object Calisthenics
- [ ] Atualizar imports
- [ ] Testar funcionalidade
- [ ] Remover arquivo original

## Rotas de Aplicação

### Migração de Rotas por Domínio

#### Rotas USERS
- `app/(user)/` → `app/users/`
- `app/(user)/conversation/$conversationId.tsx` → `app/users/conversations/$conversationId.tsx`
- `app/(user)/settings/` → `app/users/settings/`

**Checklist por rota:**
- [ ] Mover arquivo para nova estrutura
- [ ] Atualizar imports
- [ ] Testar navegação
- [ ] Validar breadcrumbs
- [ ] Remover arquivo original

#### Rotas PROJECTS
- `app/project/` → `app/projects/`
- `app/create-project.tsx` → `app/projects/create.tsx`
- `app/create-channel.tsx` → `app/projects/create-channel.tsx`

**Checklist por rota:**
- [ ] Mover arquivo para nova estrutura
- [ ] Atualizar imports
- [ ] Testar navegação
- [ ] Validar breadcrumbs
- [ ] Remover arquivo original

## Shared Types - Reorganização

### Migração para Estrutura de Domínios

#### `shared/types/user.types.ts`
- **Destino:** `shared/types/domains/users/user.types.ts`
- **Status:** ❌ Pendente

**Checklist:**
- [ ] Criar estrutura domains/users/
- [ ] Mover arquivo
- [ ] Atualizar todos os imports
- [ ] Verificar compilação TypeScript
- [ ] Remover arquivo original

#### `shared/types/project.types.ts`
- **Destino:** `shared/types/domains/projects/project.types.ts`
- **Status:** ❌ Pendente

**Checklist:**
- [ ] Criar estrutura domains/projects/
- [ ] Mover arquivo
- [ ] Atualizar todos os imports
- [ ] Verificar compilação TypeScript
- [ ] Remover arquivo original

#### `shared/types/agent.types.ts`
- **Destino:** `shared/types/domains/agents/agent.types.ts`
- **Status:** ❌ Pendente

**Checklist:**
- [ ] Criar estrutura domains/agents/
- [ ] Mover arquivo
- [ ] Atualizar todos os imports
- [ ] Verificar compilação TypeScript
- [ ] Remover arquivo original

#### `shared/types/llm-provider.types.ts`
- **Destino:** `shared/types/domains/llm/llm-provider.types.ts`
- **Status:** ❌ Pendente

**Checklist:**
- [ ] Criar estrutura domains/llm/
- [ ] Mover arquivo
- [ ] Atualizar todos os imports
- [ ] Verificar compilação TypeScript
- [ ] Remover arquivo original

#### `shared/types/channel.types.ts`
- **Destino:** `shared/types/domains/projects/channel.types.ts`
- **Status:** ❌ Pendente

**Checklist:**
- [ ] Mover para domains/projects/
- [ ] Atualizar todos os imports
- [ ] Verificar compilação TypeScript
- [ ] Remover arquivo original

#### `shared/types/message.types.ts`
- **Destino:** `shared/types/domains/users/message.types.ts`
- **Status:** ❌ Pendente

**Checklist:**
- [ ] Mover para domains/users/
- [ ] Atualizar todos os imports
- [ ] Verificar compilação TypeScript
- [ ] Remover arquivo original

#### `shared/types/channel-message.types.ts`
- **Destino:** `shared/types/domains/projects/channel-message.types.ts`
- **Status:** ❌ Pendente

**Checklist:**
- [ ] Mover para domains/projects/
- [ ] Atualizar todos os imports
- [ ] Verificar compilação TypeScript
- [ ] Remover arquivo original

## Cronograma de Execução

### Sprint 1: Preparação (2-3 dias)
- Criar estrutura de domínios
- Migrar shared types
- Configurar ferramentas de validação

### Sprint 2: Domínio LLM (3-4 dias)
- `llm-provider.store.ts` (220 linhas)
- `llm-provider-form-modal.tsx` (213 linhas)
- Arquivos simples do domínio

### Sprint 3: Domínio AGENTS (4-5 dias)
- `agent-dashboard.tsx` (444 linhas) - CRÍTICO
- `use-agents.hook.ts` (125 linhas)

### Sprint 4: Domínio USERS (6-8 dias)
- `conversation-view.tsx` (249 linhas) - CRÍTICO
- `conversation-list.tsx` (128 linhas)
- `use-direct-message-chat.hook.ts` (171 linhas)
- `user-sidebar.tsx` (127 linhas)
- Stores e hooks do domínio

### Sprint 5: Domínio PROJECTS - Parte 1 (8-10 dias)
- `file-explorer.tsx` (401 linhas) - CRÍTICO
- `terminal-panel.tsx` (342 linhas) - CRÍTICO
- `use-channel-chat.hook.ts` (383 linhas) - CRÍTICO
- `channel-message.store.ts` (343 linhas) - CRÍTICO

### Sprint 6: Domínio PROJECTS - Parte 2 (6-8 dias)
- `add-agent-modal.tsx` (343 linhas) - CRÍTICO
- `channel.store.ts` (303 linhas) - CRÍTICO
- `kanban-board.tsx` (252 linhas) - CRÍTICO
- `agents-sidebar.tsx` (220 linhas) - CRÍTICO

### Sprint 7: Domínio PROJECTS - Parte 3 (4-6 dias)
- `create-channel-modal.tsx` (203 linhas) - CRÍTICO
- `project-navigation.tsx` (177 linhas) - CRÍTICO
- Componentes moderados restantes

### Sprint 8: Finalizações (3-4 dias)
- Arquivos simples restantes
- Migração de rotas
- Cleanup e validação final

## Métricas de Progresso

### Tracking por Arquivo

**Status dos Arquivos:**
- ❌ Pendente: 139 arquivos
- 🔄 Em Progresso: 0 arquivos
- ✅ Concluído: 0 arquivos
- 🗑️ Removido: 0 arquivos

### Métricas Object Calisthenics

**Antes da Migração:**
- Arquivos >50 linhas: 45 arquivos
- Métodos >10 linhas: ~200 métodos
- Classes >2 variáveis: ~25 classes
- Uso de else: ~150 ocorrências

**Meta Pós-Migração:**
- Arquivos >50 linhas: 0
- Métodos >10 linhas: 0
- Classes >2 variáveis: 0
- Uso de else: 0

### Progresso por Domínio

**USERS:** 0/10 arquivos concluídos
**PROJECTS:** 0/75 arquivos concluídos
**AGENTS:** 0/2 arquivos concluídos
**LLM:** 0/3 arquivos concluídos
**SHARED:** 0/49 arquivos concluídos

## Validação e Testes

### Processo de Validação por Arquivo

1. **Validação Técnica**
   - `npm run type-check` - Zero erros TypeScript
   - `npm run lint` - Zero violations ESLint
   - `npm run test` - Testes específicos passando

2. **Validação Object Calisthenics**
   - Arquivo ≤50 linhas
   - Métodos ≤10 linhas
   - ≤2 variáveis de instância
   - Zero uso de else

3. **Validação Funcional**
   - Funcionalidade preservada 100%
   - Performance mantida
   - UI/UX idênticos

4. **Validação de Integração**
   - Imports funcionando
   - IPC calls funcionando
   - Navegação funcionando

### Critérios de Aprovação

Arquivo aprovado apenas quando:
- ✅ Todas as validações passando
- ✅ Code review aprovado
- ✅ Testes funcionais OK
- ✅ Object Calisthenics 100%

## Riscos e Mitigações

### Riscos Identificados

1. **Quebra de Funcionalidade**
   - Mitigação: Validação rigorosa por arquivo
   - Rollback: Manter arquivo original até aprovação

2. **Problemas de Performance**
   - Mitigação: Benchmarks antes/depois
   - Monitoramento: Metrics contínuos

3. **Regressões de UI**
   - Mitigação: Testes visuais por arquivo
   - Validação: Screenshots antes/depois

### Plano de Rollback

**Por Arquivo:**
- Manter backup até validação final
- Rollback independente possível
- Não impacta outros arquivos

**Por Domínio:**
- Checkpoint por domínio
- Rollback de domínio completo
- Validação intensiva entre domínios

## Conclusão

Este plano implementa a estratégia arquivo por arquivo com checklist detalhado para cada um dos 139 arquivos identificados. A migração seguirá rigorosamente Object Calisthenics e resultará em uma codebase completamente reorganizada por domínios.

**Estimativa Total:** 18-25 dias de desenvolvimento  
**Arquivos Críticos:** 15 arquivos (requerem refatoração intensiva)  
**Arquivos Simples:** 45 arquivos (migração direta)  
**Benefício:** Codebase 100% compatível com Object Calisthenics e DDD