# Plano de Refatoração `src_refactored` (Checklist Detalhado)

**Data de Geração:** 5 de julho de 2025

**Contexto:** Refatoração completa do diretório `src_refactored` para simplificar o código, melhorar a segurança de tipos e aderir às boas práticas de programação. O trabalho será guiado por erros de compilação e lint.

---

## **Fase 1: Definição Canônica de Tipos e Resolução de Módulos**

Esta fase visa estabelecer uma base sólida para os tipos, garantindo que cada entidade e tipo IPC seja definido em seu local canônico e importado corretamente.

### **1.1. Padronizar Entidades de Domínio**

- [x] **Mover Entidades para o Domínio:**
    - [x] Criar `src_refactored/core/domain/entities/persona.ts` e mover `PersonaTemplate`, `PersonaTemplateFormData`.
    - [x] Criar `src_refactored/core/domain/entities/agent.ts` e mover `AgentInstance`, `AgentInstanceFormData`, `AgentLLM`.
    - [x] Criar `src_refactored/core/domain/entities/llm.ts` e mover `LLMConfig`, `LLMConfigFormData`, `LLMSettings`.
    - [x] Criar `src_refactored/core/domain/entities/chat.ts` e mover `ChatMessage`, `ChatMessageSender`, `DirectMessageItem`.
    - [x] Criar `src_refactored/core/domain/entities/user.ts` e mover `UserProfile`, `UserProfileFormData`.
    - [x] Criar `src_refactored/core/domain/entities/app-settings.ts` e mover `AppSettings`, `Theme`.
- [x] **Corrigir Importações Internas das Novas Entidades:**
    - [x] Em `src_refactored/core/domain/entities/agent.ts`, garantir que `LLMConfig` seja importado de `./llm`.
    - [x] Em `src_refactored/core/domain/entities/llm.ts`, garantir que `AgentLLM` seja importado de `./agent`.
- [x] **Atualizar `src_refactored/shared/types/entities.ts`:**
    - [x] Remover todas as definições de interface diretas.
    - [x] Adicionar re-exportações para todos os novos arquivos de entidade em `src_refactored/core/domain/entities/`.
- [x] **Atualizar `src_refactored/shared/ipc-types/index.ts`:**
    - [x] Remover `export * from "../types/entities";`.
    - [x] Importar e re-exportar os tipos IPC específicos de seus novos arquivos (ex: `export * from "./agent.types";`, `export * from "./persona.types";`, etc.).

### **1.2. Corrigir Importações em Todos os Arquivos Afetados**

- [ ] **Pesquisa Global por Importações Problemáticas:**
    - [ ] Pesquisar todas as instâncias de `from "@/shared/ipc-types"` e `from "@/shared/types/entities"` e inspecioná-las manualmente.
- [ ] **Corrigir Importações (Iterativo):**
    - [ ] Para cada arquivo que reporta `TS2307` (`Cannot find module`) e `TS2724` (`*Data` suffix`):
        - [ ] Atualizar as importações para apontar para os novos arquivos de tipos IPC (`@/shared/ipc-types/agent.types`, `@/shared/ipc-types/persona.types`, etc.) ou para as entidades de domínio corretas (`@/core/domain/entities/project`, etc.).
        - [ ] Remover quaisquer importações redundantes que causem erros `TS2300` (`Duplicate identifier`).
        - [ ] Substituir os tipos com sufixo `*Data` por seus equivalentes corretos (ex: `GetAgentInstanceDetailsResponseData` para `GetAgentInstanceDetailsResponse`).
    - [x] **Arquivos a serem verificados e corrigidos (baseado nos últimos erros):**
        - [x] `src_refactored/presentation/electron/main/handlers/agent-instance.handlers.ts`
        - [x] `src_refactored/presentation/electron/main/handlers/dm.handlers.ts`
        - [x] `src_refactored/presentation/electron/main/handlers/llm-config.handlers.ts`
        - [x] `src_refactored/presentation/electron/main/handlers/persona-template.handlers.ts`
        - [x] `src_refactored/presentation/electron/main/handlers/user.handlers.ts`
        - [x] `src_refactored/presentation/ui/app/app/personas/$templateId/edit/index.tsx`
        - [x] `src_refactored/presentation/ui/app/app/personas/new/index.tsx`
        - [x] `src_refactored/presentation/ui/app/app/projects/$projectId/docs/index.tsx` (Verificar `DocEntry` e `mockDocsFileSystem` novamente)
        - [x] `src_refactored/presentation/ui/app/app/projects/$projectId/settings/index.tsx`
        - [x] `src_refactored/presentation/ui/app/app/projects/index.tsx`
        - [x] `src_refactored/presentation/ui/features/agent/components/AgentInstanceForm.tsx`
        - [x] `src_refactored/presentation/ui/features/agent/components/EditAgentFormRenderer.tsx`
        - [x] `src_refactored/presentation/ui/features/agent/components/NewAgentFormRenderer.tsx`
        - [x] `src_refactored/presentation/ui/features/agent/components/fields/AgentLLMConfigSelectField.tsx`
        - [x] `src_refactored/presentation/ui/features/agent/components/fields/AgentPersonaTemplateSelectField.tsx`
        - [x] `src_refactored/presentation/ui/features/chat/components/ChatSidebar.tsx`
        - [x] `src_refactored/presentation/ui/features/persona/components/edit/EditPersonaTemplateFormRenderer.tsx`
        - [x] `src_refactored/presentation/ui/features/persona/components/PersonaTemplateForm.tsx`
        - [x] `src_refactored/presentation/ui/features/project/components/ProjectSidebar.tsx`
        - [x] `src_refactored/presentation/ui/features/user/components/fields/EmailDisplayField.tsx`
        - [x] `src_refactored/presentation/ui/features/user/components/layout/UserSidebarParts.tsx`
        - [x] `src_refactored/presentation/ui/features/user/components/UserSidebar.tsx`
        - [x] `src_refactored/presentation/ui/hooks/ipc/useIpcSubscription.ts`
        - [x] `src_refactored/presentation/ui/hooks/useAgentInstanceData.ts`
        - [x] `src_refactored/presentation/ui/hooks/useChatLogic.ts`
        - [x] `src_refactored/presentation/ui/hooks/useConversationMessages.ts`
        - [x] `src_refactored/presentation/ui/hooks/useDirectMessages.ts`
        - [x] `src_refactored/presentation/ui/hooks/useMessageSending.ts`
        - [x] `src_refactored/presentation/ui/hooks/useNewAgentInstanceData.ts`
        - [x] `src_refactored/presentation/ui/hooks/useUpdateAgentInstance.ts`
        - [x] `src_refactored/presentation/ui/utils/agent-status.ts`

#### **Fase 2: Modernizando Hooks IPC e Simplificando Componentes Consumidores**

Esta fase visa simplificar a API dos hooks IPC e, consequentemente, o código dos componentes que os utilizam.

- [x] **Refatorar `useIpcQuery` (`src_refactored/presentation/ui/hooks/ipc/useIpcQuery.ts`):**
    - [x] Modificar o hook para que sua função interna (`ipcQueryFn`) chame `window.electronIPC.invoke`. Se a resposta for `success: true`, ela retornará `result.data` (o dado puro). Se for `success: false`, ela lançará um `Error` com a mensagem de erro.
    - [x] Ajustar a tipagem de `IpcQueryOptions` para incluir `onError` explicitamente, garantindo compatibilidade com as opções do `@tanstack/react-query`.
    - [x] Garantir que o hook retorne diretamente os valores de `data`, `isLoading`, `error` e `refetch` do `useQuery` do TanStack, que agora estarão com os tipos corretos e o comportamento esperado.
- [x] **Refatorar `useIpcMutation` (`src_refactored/presentation/ui/hooks/ipc/useIpcMutation.ts`):**
    - [x] Modificar o hook para que sua função interna (`ipcMutationFn`) chame `window.electronIPC.invoke`. Se a resposta for `success: true`, ela retornará `result.data`. Se for `success: false`, ela lançará um `Error`.
    - [x] O `onSuccess` e `onError` das opções do `useMutation` receberão os dados desempacotados ou o erro diretamente.
- [ ] **Refatorar `useIpcSubscription` (`src_refactored/presentation/ui/hooks/ipc/useIpcSubscription.ts`):**
    - [ ] Modificar a função `useInitialIpcData` para usar a mesma lógica de `ipcQueryFn` para buscar os dados iniciais, retornando o dado puro ou lançando um erro.
    - [ ] Ajustar a tipagem da `options.getSnapshot` para que ela receba o dado puro (`InitialData | null`) e retorne o dado puro.
    - [ ] Garantir que o retorno do `useIpcSubscription` seja `{ data: InitialData | null, isLoading: boolean, error: Error | null }`.
- [ ] **Atualizar Componentes Consumidores (Remover Desempacotamento Manual e Props Obsoletas):**
    - [ ] **`PersonaTemplateForm` e Renderers:**
        - [ ] Remover as props obsoletas (`onSubmit`, `isSubmitting`, `initialValues`, `submitButtonText`) de `PersonaTemplateFormProps` e de suas chamadas em `NewPersonaTemplatePage` e `EditPersonaTemplateFormRenderer`.
    - [ ] **`ProjectListItem`:**
        - [ ] Corrigir a inconsistência do campo `description` entre `Project` e `ProjectListItem` (já feito).
    - [ ] **`useChatLogic`, `useAgentInstanceData`, `useDirectMessages`:**
        - [ ] Remover todas as verificações manuais de `success` e `data` de `IPCResponse`, pois os hooks agora desempacotam isso.
        - [ ] Digitar explicitamente os parâmetros `any` (por exemplo, `conv` em `useChatLogic`).
    - [ ] **Router Paths:**
        - [ ] Corrigir os erros de caminho do roteador (`TS2820`, `TS2353`) em componentes como `ProjectContextSidebar.tsx` e `ProjectSidebar.tsx` usando a sintaxe correta de `Link` com `params` (já feito).
    - [ ] **`string | undefined` para `string`:**
        - [ ] Onde um campo opcional (`string | undefined`) está sendo atribuído a um campo obrigatório (`string`), adicionar um fallback (`?? ''`) ou ajustar a tipagem se a `undefined` for uma possibilidade válida.

#### **Fase 3: Verificação Final**

- [ ] Executar `npx tsc --noEmit`.
- [ ] Executar `npx eslint .`.

---
**Próximo Passo Concreto para o Próximo Agente:**

O próximo agente deve começar pela **Fase 1, Passo 1.1. Padronizar Entidades de Domínio**, continuando a criação dos arquivos de entidade e a atualização dos arquivos `shared/types/entities.ts` e `shared/ipc-types/index.ts`.
