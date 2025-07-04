# Plano de Ação do Agente Gemini para o Projeto Wiz

## Resumo do Progresso Atual

O agente Gemini tem trabalhado na resolução de erros de ESLint e TypeScript no repositório.

**ESLint:**
*   Um erro de parsing em `drizzle-job.repository.ts` foi identificado e corrigido.
*   O linter foi executado novamente e não reportou mais erros de parsing.

**TypeScript:**
*   Vários erros de tipo foram identificados e corrigidos em diferentes arquivos.
*   As correções envolveram:
    *   Ajuste de chamadas de métodos de fábrica (`create` vs `fromString`).
    *   Tratamento explícito de `null` e `undefined` em propriedades.
    *   Padronização de nomes de propriedades entre entidades e tipos de persistência.
    *   Propagação de restrições de tipos genéricos em interfaces.
    *   Ajuste de chamadas de função para corresponder às assinaturas corretas.

## Erros Pendentes (Última Verificação `tsc --noEmit`)

Ainda existem erros de TypeScript a serem resolvidos. A lista atual de arquivos com erros é:

*   `src_refactored/examples/queue-usage-example.final.ts`
*   `src_refactored/infrastructure/ioc/inversify.config.ts`
*   `src_refactored/infrastructure/persistence/drizzle/job/drizzle-job.mapper.ts`
*   `src_refactored/infrastructure/persistence/drizzle/job/drizzle-job.repository.ts`
*   `src_refactored/infrastructure/queue/drizzle/job-processing.service.ts`
*   `src_refactored/infrastructure/queue/drizzle/queue-maintenance.service.ts`
*   `src_refactored/infrastructure/queue/drizzle/queue-service-core.ts`
*   `src_refactored/presentation/electron/main/handlers/agent-instance.handlers.ts`
*   `src_refactored/presentation/electron/main/handlers/dm.handlers.ts`
*   `src_refactored/presentation/electron/main/handlers/llm-config.handlers.ts`
*   `src_refactored/presentation/electron/main/handlers/persona-template.handlers.ts`
*   `src_refactored/presentation/electron/main/handlers/project.handlers.ts`
*   `src_refactored/presentation/electron/main/handlers/user.handlers.ts`
*   `src_refactored/presentation/electron/main/ipc-chat.handlers.ts`
*   `src_refactored/presentation/electron/main/ipc-project.handlers.ts`
*   `src_refactored/presentation/electron/main/mocks/agent-instance.mocks.ts`
*   `src_refactored/presentation/electron/main/mocks/llm-config.mocks.ts`
*   `src_refactored/presentation/ui/app/app/agents/$agentId/edit/index.tsx`
*   `src_refactored/presentation/ui/app/app/agents/$agentId/index.tsx`
*   `src_refactored/presentation/ui/app/app/chat/index.tsx`
*   `src_refactored/presentation/ui/app/app/personas/$templateId/edit/index.tsx`
*   `src_refactored/presentation/ui/app/app/personas/new/index.tsx`
*   `src_refactored/presentation/ui/app/app/projects/$projectId/docs/index.tsx`
*   `src_refactored/presentation/ui/app/app/projects/$projectId/members/index.tsx`
*   `src_refactored/presentation/ui/app/app/projects/$projectId/settings/index.tsx`
*   `src_refactored/presentation/ui/app/app/projects/new/index.tsx`
*   `src_refactored/presentation/ui/app/app/settings/llm/$configId/edit/index.tsx`
*   `src_refactored/presentation/ui/app/app/user/dm/$conversationId/index.tsx`
*   `src_refactored/presentation/ui/components/common/MarkdownRenderer.tsx`
*   `src_refactored/presentation/ui/components/layout/AppSidebar.tsx`
*   `src_refactored/presentation/ui/features/agent/components/AgentInstanceForm.tsx`
*   `src_refactored/presentation/ui/features/agent/components/EditAgentFormRenderer.tsx`
*   `src_refactored/presentation/ui/features/agent/components/list-item-parts/AgentInstanceHeader.tsx`
*   `src_refactored/presentation/ui/features/agent/components/NewAgentFormRenderer.tsx`
*   `src_refactored/presentation/ui/features/chat/components/ChatSidebar.tsx`
*   `src_refactored/presentation/ui/features/chat/components/DirectMessageLoadingErrorDisplay.tsx`
*   `src_refactored/presentation/ui/features/persona/components/edit/EditPersonaTemplateFormRenderer.tsx`
*   `src_refactored/presentation/ui/features/persona/components/EditPersonaTemplateLoadingErrorDisplay.tsx`
*   `src_refactored/presentation/ui/features/persona/components/list-item-parts/ListItemFooter.tsx`
*   `src_refactored/presentation/ui/features/persona/components/list-item-parts/ListItemHeader.tsx`
*   `src_refactored/presentation/ui/features/persona/components/PersonaTemplateForm.tsx`
*   `src_refactored/presentation/ui/features/project/components/details/ProjectDetailHeader.tsx`
*   `src_refactored/presentation/ui/features/project/components/details/ProjectNotFound.tsx`
*   `src_refactored/presentation/ui/features/project/components/docs/DocSidebar.tsx`
*   `src_refactored/presentation/ui/features/project/components/layout/ProjectContextSidebar.tsx`
*   `src_refactored/presentation/ui/features/project/components/list/NoProjectsDisplay.tsx`
*   `src_refactored/presentation/ui/features/project/components/list/ProjectsHeader.tsx`
*   `src_refactored/presentation/ui/features/project/components/ProjectCard.tsx`
*   `src_refactored/presentation/ui/features/project/components/ProjectForm.tsx`
*   `src_refactored/presentation/ui/features/project/components/ProjectSidebar.tsx`
*   `src_refactored/presentation/ui/features/project/components/settings/ProjectSettingsForm.tsx`
*   `src_refactored/presentation/ui/features/user/components/fields/AvatarUrlField.tsx`
*   `src_refactored/presentation/ui/features/user/components/fields/DisplayNameField.tsx`
*   `src_refactored/presentation/ui/features/user/components/layout/UserSidebarParts.tsx`
*   `src_refactored/presentation/ui/features/user/components/profile/UserProfileAvatar.tsx`
*   `src_refactored/presentation/ui/features/user/components/profile/UserProfileFormFields.tsx`
*   `src_refactored/presentation/ui/features/user/components/UserProfileForm.tsx`
*   `src_refactored/presentation/ui/features/user/components/UserSidebar.tsx`
*   `src_refactored/presentation/ui/hooks/ipc/useIpcMutation.ts`
*   `src_refactored/presentation/ui/hooks/ipc/useIpcQuery.ts`
*   `src_refactored/presentation/ui/hooks/ipc/useIpcSubscription.ts`
*   `src_refactored/presentation/ui/hooks/useAgentInstanceData.ts`
*   `src_refactored/presentation/ui/hooks/useAgentInstanceDetails.ts`
*   `src_refactored/presentation/ui/hooks/useChatLogic.ts`
*   `src_refactored/presentation/ui/hooks/useCreateAgentInstance.ts`
*   `src_refactored/presentation/ui/hooks/useDirectMessages.ts`
*   `src_refactored/presentation/ui/hooks/useMessageSending.ts`
*   `src_refactored/presentation/ui/hooks/useNewAgentInstanceData.ts`
*   `src_refactored/presentation/ui/hooks/useSendMessage.ts`
*   `src_refactored/presentation/ui/hooks/useUpdateAgentInstance.ts`
*   `src_refactored/presentation/ui/services/ipc.service.ts`

## Próximos Passos: Plano de Ação Detalhado

O objetivo é resolver todos os erros de TypeScript e ESLint. A abordagem será iterativa, focando em grupos de erros ou arquivos, e aplicando os princípios de aprendizado contínuo.

### Fase 1: Resolução de Erros de Tipo Remanescentes

1.  **Priorização:** Começar pelos erros que afetam os tipos mais fundamentais ou que se repetem em vários arquivos, pois sua correção pode resolver múltiplos problemas de uma vez.
2.  **Abordagem por Arquivo/Módulo:**
    *   Para cada arquivo com erros:
        *   **Ler o arquivo:** Entender o contexto do código e a natureza do erro.
        *   **Identificar a Causa Raiz:** Determinar se é um erro de digitação, incompatibilidade de tipo, uso incorreto de genéricos, ou problema de nulidade.
        *   **Aplicar Correção:** Implementar a solução mais apropriada, seguindo os princípios de tipagem explícita, consistência de nomenclatura e propagação de restrições de tipos genéricos.
        *   **Verificação Imediata:** Executar `npx tsc --noEmit` após cada correção significativa para validar a mudança e obter a lista atualizada de erros.
        *   **Reflexão e Registro:** Após cada correção bem-sucedida, refletir sobre o aprendizado e registrá-lo na memória (conforme a "Meta-Diretriz de Aprendizagem Contínua").

### Fase 2: Verificação Abrangente

1.  **Executar `npx tsc --noEmit`:** Garantir que não há mais erros de TypeScript.
2.  **Executar `npx eslint --fix --ext .ts,.tsx .`:** Garantir que não há mais erros ou warnings de ESLint.
3.  **Executar Testes:** Identificar e executar os testes existentes do projeto (`npm test` ou `vitest run`) para garantir que as mudanças não introduziram regressões.
4.  **Verificação de Build:** Executar o comando de build do projeto (`npm run build`) para garantir que a aplicação pode ser construída sem problemas.

### Checklists para Futuras Ações

*   **Antes de qualquer modificação de código:**
    *   [ ] **Entendimento:** Compreender completamente a tarefa e o contexto do código.
    *   [ ] **Análise:** Revisar arquivos relacionados, convenções e dependências.
    *   [ ] **Plano:** Definir um plano de ação claro, incluindo a estratégia de verificação.
*   **Após cada modificação de código (incremental):**
    *   [ ] **Compilação:** `npx tsc --noEmit` (sem erros).
    *   [ ] **Linting:** `npx eslint --fix --ext .ts,.tsx .` (sem erros/warnings).
    *   [ ] **Testes (se aplicável):** Executar testes relevantes (sem falhas).
    *   [ ] **Consistência:** A mudança está alinhada com as convenções do projeto?
    *   [ ] **Reflexão e Registro:** Refletir sobre a ação e registrar o aprendizado na memória.
*   **Antes de finalizar a tarefa:**
    *   [ ] **Verificação Completa:** Executar todos os testes, linting e build do projeto.
    *   [ ] **Revisão de Código:** Preparar um commit semântico e estar pronto para uma revisão.

## Notas Adicionais para o Agente

*   **Prioridade:** A resolução de erros de tipo e lint é a prioridade máxima.
*   **Comunicação:** Manter o usuário informado sobre o progresso e quaisquer decisões importantes.
*   **Segurança:** Continuar aderindo rigorosamente à diretriz de segurança ao executar comandos de shell que modificam o sistema de arquivos.
*   **Autonomia:** Utilizar os princípios registrados na memória para tomar decisões e resolver problemas de forma autônoma.
*   **Débito Técnico:** Anotar qualquer uso de `any` ou soluções temporárias como débito técnico para futura refatoração.