# Brainstorm Session - Refatoração e Reorganização do Renderer

**Data:** 2025-07-15  
**Duração:** Sessão Inicial  
**Participantes:** Usuário, Claude Code

---

## Contexto

### Objetivo da Sessão

Refatorar e reorganizar o renderer para melhorar a codificação, criando simplificações que melhorem a manutenibilidade, aplicando clean code, maximizando reaproveitamento de código, implementando Object Calisthenics, reorganizando códigos e suas localizações, e garantindo que a integração com o main process esteja correta com todas as funções/domínios necessários.

### Cenário Atual

O renderer possui uma estrutura bem organizada por features, mas apresenta várias oportunidades de melhoria:

- **Estrutura de Features**: Organizadas por domínio, mas com naming inconsistente em relação aos domínios do main process
- **Stores**: Implementações pesadas violando Object Calisthenics (>50 linhas, múltiplas responsabilidades)
- **Componentes**: Alguns componentes grandes misturando lógica e apresentação
- **Hooks**: Complexos com múltiplas responsabilidades
- **Integração IPC**: Padrões inconsistentes entre features

### Motivação

A aplicação está em crescimento e precisa de uma arquitetura frontend mais limpa e manutenível. O atual projeto segue uma nova arquitetura simplificada baseada em domínios no main process, e o renderer precisa ser alinhado com esses padrões seguindo Object Calisthenics e clean code.

---

## Tópicos Discutidos

### Análise da Estrutura Atual

**Descrição:** Investigação detalhada da organização atual do renderer, identificando pontos fortes e áreas de melhoria.

**Pontos Levantados:**

- Feature-based organization é uma boa base, mas precisa de alinhamento com domínios
- Naming inconsistente: `project-management/` vs domínio `projects/`
- Stores implementados como classes pesadas em vez de padrões funcionais simples
- Componentes excedem 50 linhas violando Object Calisthenics
- Hooks misturan múltiplas responsabilidades (state, API, effects, caching)

**Considerações Técnicas:**

- TanStack Router bem integrado com file-based routing
- Type safety forte com TypeScript e shared types
- IPC bem estruturado com domain-specific APIs
- Uso de Zustand para state management, mas implementado de forma complexa

**Impactos Identificados:**

- **Sistema**: Dificuldade de manutenção e extensão
- **Usuário**: Potencial impacto na performance devido a componentes grandes
- **Desenvolvimento**: Curva de aprendizado alta para novos desenvolvedores

### Oportunidades de Simplificação

**Descrição:** Identificação de padrões que podem ser simplificados seguindo Object Calisthenics.

**Pontos Levantados:**

- Stores classes podem ser convertidas em simple state + functions
- Componentes grandes podem ser decompostos em micro-components
- Hooks podem ser quebrados em single-purpose hooks
- Feature directories podem ser renomeadas para alinhar com domínios

**Considerações Técnicas:**

- Manter type safety durante refatoração
- Preservar funcionalidade existente
- Implementar mudanças incrementais
- Seguir princípios de Object Calisthenics: max 2 instance variables, max 10 lines per method, max 50 lines per class

**Impactos Identificados:**

- **Sistema**: Melhor legibilidade e manutenibilidade
- **Usuário**: Performance potencialmente melhorada
- **Desenvolvimento**: Facilita onboarding e desenvolvimento futuro

### Integração Main-Renderer

**Descrição:** Análise da comunicação entre main process e renderer, identificando inconsistências.

**Pontos Levantados:**

- IPC bem estruturado com domain-specific APIs
- Uso inconsistente: mix de domain APIs e generic `invoke`
- Error handling inconsistente entre features
- Loading states não padronizados

**Considerações Técnicas:**

- Manter type safety na comunicação IPC
- Padronizar error boundaries
- Implementar loading states consistentes
- Garantir que todos os domínios do main tenham representação no renderer

**Impactos Identificados:**

- **Sistema**: Comunicação mais robusta e previsível
- **Usuário**: Melhor experiência com error handling
- **Desenvolvimento**: Padrões consistentes facilitam manutenção

---

## Decisões Tomadas

### Decisão 1: Priorização Estrutural com Migração Incremental

**Descrição:** Decidido começar pela reorganização estrutural, migrando um arquivo/funcionalidade por vez para nova estrutura, aplicando Object Calisthenics e simplificação no processo.

**Justificativa:** Abordagem estrutural primeiro garante alinhamento com domínios do main process e facilita manutenção futura. Migração incremental reduz risco de breaking changes.

**Alternativas Consideradas:** Simplificação de componentes primeiro, ou big bang migration.

**Impacto:** Permite refatoração gradual mantendo funcionalidade, com alinhamento arquitetural desde o início.

### Decisão 2: Maximizar TanStack Router Preload e Reorganizar Rotas

**Descrição:** Utilizar ao máximo o preload das rotas do TanStack Router e repensar separação de rotas para melhorar separação de código e navegabilidade.

**Justificativa:** Melhora performance, reduz código por área e aproveita melhor funcionalidades do TanStack Router.

**Alternativas Consideradas:** Manter estrutura atual de rotas com otimizações pontuais.

**Impacto:** Melhor performance, separação de conceitos e reaproveitamento de funcionalidades.

### Decisão 3: Migração Arquivo por Arquivo com Refatoração Completa

**Descrição:** Reestruturação arquitetural do frontend deve ser feita arquivo por arquivo, aplicando todas as melhorias necessárias para a nova arquitetura e removendo o arquivo refatorado na conclusão.

**Justificativa:** Abordagem incremental reduz riscos, permite validação contínua e garante que cada arquivo migrado esteja completamente alinhado com a nova arquitetura.

**Alternativas Consideradas:** Migração em lotes por feature ou big bang migration.

**Impacto:** Processo mais controlado, validação contínua de integração IPC, garantia de funcionalidade completa a cada migração.

---

## Considerações e Observações

### Pontos de Atenção

- **Migração incremental**: Refatoração deve ser feita gradualmente para não quebrar funcionalidade existente
- **Type safety**: Manter forte tipagem durante todo o processo
- **Performance**: Monitorar impacto de mudanças na performance
- **Testes**: Garantir que testes existentes continuem funcionando

### Questões em Aberto

- **Bundle Splitting**: Implementar code splitting por domínio ou manter atual?
- **Error Boundaries**: Como padronizar tratamento de erros entre domínios?
- **Loading States**: Criar componentes shared para loading patterns?
- **Real-time Features**: Como integrar websockets/SSE futuramente?

### Decisões Adicionais Tomadas

- **State Management**: Manter Zustand para estado do renderer + TanStack Query apenas para buscas no backend
- **Component Libraries**: Manter Radix-UI (parte do shadcn/ui)
- **Testes**: Não criar testes durante refatoração, foco na implementação

### Insights e Descobertas

- **Arquitetura sólida**: Base existente é boa, precisa de refinamento
- **Object Calisthenics**: Muitas oportunidades de aplicação para melhorar legibilidade
- **Domain alignment**: Oportunidade de alinhar completamente frontend com backend
- **Reaproveitamento**: Muitos padrões podem ser extraídos e reutilizados

---

## Artefatos e Referências

### Código Analisado

- `src/renderer/features/` - Estrutura de features por domínio
- `src/renderer/features/*/stores/` - Implementações de stores
- `src/renderer/features/*/hooks/` - Hooks customizados
- `src/renderer/features/*/components/` - Componentes por feature
- `src/renderer/preload.ts` - Integração IPC
- `src/shared/types/` - Tipos compartilhados

### Documentação Consultada

- `CLAUDE.md` - Arquitetura e padrões do projeto
- `docs/templates/brainstorm-template.md` - Template para brainstorm
- Object Calisthenics principles
- Clean Code principles

### Exemplos e Comparações

- Padrão atual de stores vs. padrão funcional simples
- Componentes grandes vs. micro-components
- Hooks multi-responsabilidade vs. single-purpose hooks

---

## Anexos

### Snippets de Código Relevantes

```typescript
// ATUAL: Store pesado (violando Object Calisthenics)
class ProjectStore {
  private state: ProjectStoreState = {
    projects: [],
    isLoading: false,
    error: null,
    selectedProject: null, // > 2 instance variables
  };

  // Métodos > 10 linhas, classe > 50 linhas
}

// PROPOSTO: Zustand slim + TanStack Query
interface ProjectState {
  selectedProject: ProjectDto | null;
  setSelectedProject: (project: ProjectDto | null) => void;
}

const useProjectStore = create<ProjectState>((set) => ({
  selectedProject: null,
  setSelectedProject: (project) => set({ selectedProject: project }),
}));

// TanStack Query para dados do backend
const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => window.electronIPC.projects.getAll(),
  });
};

const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectDto) =>
      window.electronIPC.projects.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};
```

### Próximos Passos

1. **Definir priorização**: Estrutural vs. Components primeiro
2. **Criar roadmap detalhado**: Sequência de refatoração
3. **Implementar changes incrementais**: Manter funcionalidade
4. **Estabelecer quality gates**: Automação para Object Calisthenics
5. **Criar padrões reusáveis**: Templates e utilities

## Inventário Completo de Arquivos para Refatoração

### 🔥 PRIORIDADE CRÍTICA - Stores (8 arquivos)

**Refatorar para Zustand simplificado + TanStack Query para backend:**

```
src/renderer/features/
├── channel-messaging/stores/
│   ├── channel-message.store.ts                # 🔥 SIMPLIFICAR (Zustand + Query)
│   └── typing.store.ts                         # 🔥 SIMPLIFICAR (Zustand local)
├── communication/stores/
│   └── channel.store.ts                        # 🔥 SIMPLIFICAR (Zustand + Query)
├── direct-messages/stores/
│   ├── conversation.store.ts                   # 🔥 SIMPLIFICAR (Zustand + Query)
│   └── message.store.ts                        # 🔥 SIMPLIFICAR (Zustand + Query)
├── llm-provider-management/stores/
│   └── llm-provider.store.ts                   # 🔥 SIMPLIFICAR (Zustand + Query)
├── project-management/stores/
│   └── project.store.ts                        # 🔥 SIMPLIFICAR (Zustand + Query)
└── user-management/stores/
    └── user.store.ts                           # 🔥 SIMPLIFICAR (Zustand + Query)
```

### ⚠️ PRIORIDADE ALTA - Hooks (13 arquivos)

**Integrar com TanStack Query:**

```
src/renderer/features/
├── agent-management/hooks/
│   └── use-agents.hook.ts                      # ⚠️ MIGRAR
├── channel-messaging/hooks/
│   ├── use-channel-chat.hook.ts                # ⚠️ MIGRAR
│   ├── use-channel-messages.hook.ts            # ⚠️ MIGRAR
│   └── use-typing.hook.ts                      # ⚠️ MIGRAR
├── communication/hooks/
│   └── use-channels.hook.ts                    # ⚠️ MIGRAR
├── direct-messages/hooks/
│   ├── use-agent-chat.hook.ts                  # ⚠️ MIGRAR
│   ├── use-conversations.hook.ts               # ⚠️ MIGRAR
│   ├── use-direct-message-chat.hook.ts         # ⚠️ MIGRAR
│   └── use-messages.hook.ts                    # ⚠️ MIGRAR
├── llm-provider-management/hooks/
│   └── use-llm-provider.hook.ts                # ⚠️ MIGRAR
├── project-management/hooks/
│   └── use-projects.hook.ts                    # ⚠️ MIGRAR
├── user-management/hooks/
│   └── use-user.hook.ts                        # ⚠️ MIGRAR
└── hooks/
    └── use-mobile.hook.ts                      # ⚠️ MIGRAR (global hook)
```

### 📱 PRIORIDADE MÉDIA - Rotas (21 arquivos)

**Otimizar com preload e reorganizar:**

```
src/renderer/app/
├── __root.tsx                                  # ✅ MANTER
├── (user)/
│   ├── route.tsx                               # 📱 OTIMIZAR
│   ├── index.tsx                               # 📱 OTIMIZAR
│   ├── ai-chat-test.tsx                        # 📱 MOVER
│   ├── new-conversation.tsx                    # 📱 REORGANIZAR
│   ├── conversation/$conversationId.tsx        # 📱 OTIMIZAR
│   └── settings/
│       ├── index.tsx                           # 📱 OTIMIZAR
│       ├── new-llm-provider.tsx                # 📱 REORGANIZAR
│       └── edit-llm-provider.$llmProviderId.tsx # 📱 REORGANIZAR
├── project/
│   ├── _layout.tsx                             # 📱 REMOVER
│   └── $projectId/
│       ├── route.tsx                           # 📱 OTIMIZAR
│       ├── index.tsx                           # 📱 OTIMIZAR
│       ├── agent/$agentId.tsx                  # 📱 REORGANIZAR
│       ├── agents/index.tsx                    # 📱 REORGANIZAR
│       ├── chat/
│       │   ├── index.tsx                       # 📱 REORGANIZAR
│       │   └── $channelId.tsx                  # 📱 REORGANIZAR
│       ├── docs/index.tsx                      # 📱 REORGANIZAR
│       ├── files/index.tsx                     # 📱 REORGANIZAR
│       └── tasks/index.tsx                     # 📱 REORGANIZAR
├── create-project.tsx                          # 📱 REORGANIZAR
└── create-channel.tsx                          # 📱 REORGANIZAR
```

### ✅ PRIORIDADE BAIXA - Componentes (38 arquivos)

**Aplicar Object Calisthenics após migração estrutural:**

```
src/renderer/
├── components/                                 # Componentes gerais (14 arquivos)
│   ├── chat/
│   │   ├── ai-chat-example.tsx                # ✅ REFATORAR
│   │   ├── chat-container.tsx                 # ✅ REFATORAR
│   │   └── message-item.tsx                   # ✅ REFATORAR
│   ├── common/
│   │   └── async-boundary.tsx                 # ✅ REFATORAR
│   ├── layout/
│   │   ├── app-sidebar.tsx                    # ✅ REFATORAR
│   │   ├── main-header.tsx                    # ✅ REFATORAR
│   │   ├── title-bar.tsx                      # ✅ REFATORAR
│   │   └── top-bar.tsx                        # ✅ REFATORAR
│   ├── skeletons/
│   │   ├── conversation-skeleton.tsx          # ✅ REFATORAR
│   │   ├── global-pending.tsx                 # ✅ REFATORAR
│   │   └── project-layout-skeleton.tsx        # ✅ REFATORAR
│   ├── custom-link.tsx                        # ✅ REFATORAR
│   ├── markdown-renderer.tsx                  # ✅ REFATORAR
│   └── page-title.tsx                         # ✅ REFATORAR
└── features/                                   # Componentes de features (24 arquivos)
    ├── agent-management/components/
    │   └── agent-dashboard.tsx                 # ✅ REFATORAR
    ├── development-tools/components/
    │   ├── file-explorer.tsx                   # ✅ REFATORAR
    │   └── terminal-panel.tsx                  # ✅ REFATORAR
    ├── direct-messages/components/
    │   ├── conversation-list.tsx               # ✅ REFATORAR
    │   ├── conversation-view.tsx               # ✅ REFATORAR
    │   └── new-conversation-modal.tsx          # ✅ REFATORAR
    ├── llm-provider-management/components/
    │   ├── llm-provider-form-modal.tsx         # ✅ REFATORAR
    │   └── llm-provider-management.tsx         # ✅ REFATORAR
    ├── project-management/components/
    │   ├── add-agent-modal.tsx                 # ✅ REFATORAR
    │   ├── agent-item.tsx                      # ✅ REFATORAR
    │   ├── agents-list.tsx                     # ✅ REFATORAR
    │   ├── agents-sidebar.tsx                  # ✅ REFATORAR
    │   ├── create-channel-modal.tsx            # ✅ REFATORAR
    │   ├── create-project-form.tsx             # ✅ REFATORAR
    │   ├── create-project-modal.tsx            # ✅ REFATORAR
    │   ├── project-card.tsx                    # ✅ REFATORAR
    │   ├── project-list.tsx                    # ✅ REFATORAR
    │   ├── project-navigation.tsx              # ✅ REFATORAR
    │   ├── project-sidebar-item.tsx            # ✅ REFATORAR
    │   ├── project-sidebar.tsx                 # ✅ REFATORAR
    │   └── right-panel.tsx                     # ✅ REFATORAR
    ├── task-management/components/
    │   └── kanban-board.tsx                    # ✅ REFATORAR
    └── user-management/components/
        ├── user-area.tsx                       # ✅ REFATORAR
        └── user-sidebar.tsx                    # ✅ REFATORAR
```

## Estrutura Final Esperada do Renderer

### Nova Organização por Domínios

```
src/renderer/
├── app/                        # 🆕 Routes otimizadas (TanStack Router)
│   ├── __root.tsx
│   ├── users/                  # 🆕 Domínio usuários
│   │   ├── _layout.tsx         # Layout com preload otimizado
│   │   ├── dashboard.tsx       # Dashboard pessoal
│   │   ├── conversations/
│   │   │   ├── _layout.tsx     # Layout conversas
│   │   │   ├── index.tsx       # Lista conversas
│   │   │   └── $conversationId.tsx # Chat específico
│   │   ├── settings/
│   │   │   ├── index.tsx       # Configurações gerais
│   │   │   ├── profile.tsx     # Perfil usuário
│   │   │   └── llm-providers.tsx # Configuração LLM
│   │   └── dev/
│   │       └── ai-chat-test.tsx # Área de testes
│   ├── projects/               # 🆕 Domínio projetos
│   │   ├── _layout.tsx         # Layout projetos
│   │   ├── index.tsx           # Lista projetos
│   │   ├── create.tsx          # Criar projeto
│   │   └── $projectId/
│   │       ├── _layout.tsx     # Layout projeto específico
│   │       ├── dashboard.tsx   # Dashboard projeto
│   │       ├── agents/
│   │       │   ├── index.tsx   # Lista agentes
│   │       │   ├── create.tsx  # Criar agente
│   │       │   └── $agentId.tsx # Chat agente
│   │       ├── channels/
│   │       │   ├── index.tsx   # Lista canais
│   │       │   ├── create.tsx  # Criar canal
│   │       │   └── $channelId.tsx # Chat canal
│   │       ├── tasks.tsx       # Gerenciamento tarefas
│   │       ├── docs.tsx        # Documentação
│   │       └── files.tsx       # Arquivos
│   └── _components/            # 🆕 Componentes específicos de rotas
├── domains/                    # 🆕 Features organizadas por domínio
│   ├── users/
│   │   ├── components/         # Componentes específicos usuários
│   │   ├── hooks/              # Hooks TanStack Query
│   │   ├── services/           # Serviços API
│   │   └── types.ts            # Tipos específicos
│   ├── projects/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types.ts
│   ├── agents/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types.ts
│   └── llm/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types.ts
├── shared/                     # 🆕 Código compartilhado
│   ├── components/
│   │   ├── ui/                 # shadcn/ui (manter)
│   │   ├── layout/             # Componentes layout
│   │   ├── forms/              # Componentes formulário
│   │   ├── feedback/           # Loading, Error, etc.
│   │   └── chat/               # Componentes chat reutilizáveis
│   ├── hooks/                  # Hooks utilitários
│   ├── services/               # Serviços base (IPC, auth, etc.)
│   ├── utils/                  # Funções utilitárias
│   └── types/                  # Tipos globais
├── providers/                  # 🆕 Providers globais
│   ├── query-client.tsx        # TanStack Query setup
│   ├── theme-provider.tsx      # Tema
│   └── router-provider.tsx     # Router
└── main.tsx                    # Entry point
```

### Benefícios da Nova Estrutura

1. **Alinhamento com Backend**: Domínios idênticos ao main process
2. **Object Calisthenics**: Componentes ≤50 linhas, métodos ≤10 linhas
3. **Performance**: Preload otimizado nas rotas críticas
4. **Manutenibilidade**: Separação clara de responsabilidades
5. **Type Safety**: Tipos organizados por domínio
6. **Reaproveitamento**: Componentes shared bem organizados
7. **Bundle Optimization**: Code splitting por domínio

## Estratégia de Migração por Fases

### **Fase 1: Infraestrutura (Semana 1)**

1. Setup TanStack Query provider
2. Criar estrutura de pastas nova
3. Configurar preload básico
4. Manter Zustand configurado

### **Fase 2: Stores Críticos (Semana 2-3)**

1. Simplificar `project.store.ts` → Zustand slim + Query para fetch
2. Simplificar `conversation.store.ts` → Zustand slim + Query para fetch
3. Simplificar `llm-provider.store.ts` → Zustand slim + Query para fetch
4. Aplicar Object Calisthenics nos stores refatorados

### **Fase 3: Reorganização Estrutural (Semana 4-5)**

1. Mover features para domínios
2. Reorganizar rotas por domínio
3. Implementar preload otimizado
4. Manter componentes Radix-UI/shadcn

### **Fase 4: Object Calisthenics (Semana 6-7)**

1. Refatorar componentes grandes
2. Simplificar hooks complexos
3. Aplicar princípios consistentemente
4. Sem criação de testes novos

### **Fase 5: Otimização e Cleanup (Semana 8)**

1. Code splitting por domínio
2. Remover código legacy
3. Documentação atualizada
4. Validar integração Zustand + Query

### Links e Recursos

- [Object Calisthenics](https://williamdurand.fr/2013/06/03/object-calisthenics/) - Princípios aplicados
- [Clean Code](https://clean-code-developer.com/) - Princípios de código limpo
- [TanStack Router](https://tanstack.com/router) - Roteamento utilizado
- [TanStack Query](https://tanstack.com/query) - State management proposto
- [React Hook Form](https://react-hook-form.com/) - Formulários

### 📋 PRIORIDADE BAIXA - Outros Arquivos (13 arquivos)

**Arquivos de infraestrutura e configuração:**

```
src/renderer/
├── contexts/
│   ├── page-title-context.tsx                  # 📋 MANTER/OTIMIZAR
│   └── theme-context.tsx                       # 📋 MANTER/OTIMIZAR
├── lib/
│   ├── placeholders.ts                         # 📋 REMOVER após real data
│   └── utils.ts                               # 📋 MANTER
├── locales/                                    # 📋 MANTER (6 arquivos)
│   ├── en/common.ts
│   ├── en/glossary.ts
│   ├── en/validation.ts
│   ├── pt-BR/common.ts
│   ├── pt-BR/glossary.ts
│   └── pt-BR/validation.ts
├── main.tsx                                    # 📋 ATUALIZAR (Query setup)
├── preload.ts                                  # 📋 MANTER
├── window.d.ts                                 # 📋 MANTER
├── globals.css                                 # 📋 MANTER
└── index.html                                  # 📋 MANTER
```

## Resumo Total de Arquivos

- **🔥 Stores**: 8 arquivos (crítico)
- **⚠️ Hooks**: 13 arquivos (alta prioridade)
- **📱 Rotas**: 21 arquivos (média prioridade)
- **✅ Componentes**: 38 arquivos (baixa prioridade)
- **📋 Outros**: 13 arquivos (infraestrutura)
- **Total**: 93 arquivos para refatoração

### Observações Importantes

1. **Missing Features**:
   - `task-management` tem componente mas não tem store
   - `agent-management` tem hooks mas não tem store
   - `development-tools` tem componentes mas não tem hooks/stores

2. **Consolidações Necessárias**:
   - `channel-messaging` + `communication` → parte de `projects`
   - `direct-messages` → parte de `users`
   - `task-management` → parte de `projects`
   - `development-tools` → parte de `projects`

## Estratégia de Migração Arquivo por Arquivo

### Processo de Migração Individual

**Para cada arquivo a ser migrado:**

1. **Análise do Arquivo Atual**
   - Identificar dependências e responsabilidades
   - Mapear integrações IPC necessárias
   - Verificar funcionalidades que precisam ser mantidas

2. **Criação na Nova Estrutura**
   - Criar arquivo na nova localização (domínios organizados)
   - Aplicar Object Calisthenics (≤50 linhas por classe, ≤10 linhas por método)
   - Implementar Clean Code (nomes descritivos, responsabilidade única)
   - Refatorar para Zustand slim + TanStack Query (quando aplicável)
   - Garantir type safety completa

3. **Validação de Integração**
   - Verificar comunicação IPC funcionando
   - Confirmar que main process tem todas as funções necessárias
   - Testar funcionalidade completa end-to-end
   - Validar que não há regressões

4. **Finalização**
   - Atualizar imports/exports nos arquivos dependentes
   - Remover arquivo antigo completamente
   - Documentar mudanças se necessário

### Princípios da Migração

**Object Calisthenics Aplicados:**

- Máximo 2 variáveis de instância por classe
- Métodos com máximo 10 linhas
- Classes com máximo 50 linhas
- Sem uso de ELSE (guard clauses)
- Primitivos encapsulados em Value Objects quando aplicável

**Clean Code Aplicado:**

- Nomes descritivos e autodocumentados
- Responsabilidade única por função/classe
- Funções pequenas e focadas
- Evitar duplicação de código

**Padrão Zustand + Query:**

- Zustand para estado local do renderer (seleções, UI state)
- TanStack Query para fetch/cache de dados do backend
- Hooks separados por responsabilidade

### Verificações de Integração IPC

**Para cada migração, verificar:**

1. **Comunicação Main-Renderer**
   - APIs IPC necessárias existem no main
   - Tipos compartilhados estão atualizados
   - Error handling apropriado

2. **Funcionalidade dos Domínios**
   - `projects`: CRUD projetos, canais, mensagens
   - `agents`: CRUD agentes, execução tarefas
   - `users`: CRUD usuários, conversas, preferências
   - `llm`: CRUD providers, configurações, text generation

3. **Padrões de Comunicação**
   - Uso correto de `window.electronIPC.[domain].[method]`
   - Fallback para `window.electronIPC.invoke` quando necessário
   - Loading states e error boundaries

### Critérios de Sucesso por Arquivo

**Arquivo considerado migrado com sucesso quando:**

- ✅ Localizado na nova estrutura de domínios
- ✅ Aplicando Object Calisthenics e Clean Code
- ✅ Integração IPC funcionando perfeitamente
- ✅ Funcionalidade completa preservada
- ✅ Type safety mantida
- ✅ Arquivo antigo removido
- ✅ Dependências atualizadas

### Ordem de Migração Sugerida

**Baseado em dependências e impacto:**

1. **Infraestrutura Base**
   - `main.tsx` (setup TanStack Query)
   - `providers/` (query-client, theme, router)
   - Estrutura de pastas `domains/`

2. **Utilitários e Shared**
   - `contexts/` → `shared/contexts/`
   - `lib/` → `shared/utils/`
   - `hooks/use-mobile.hook.ts` → `shared/hooks/`

3. **Stores Críticos** (alta dependência)
   - `project.store.ts` → `domains/projects/store.ts`
   - `conversation.store.ts` → `domains/users/store.ts`
   - `llm-provider.store.ts` → `domains/llm/store.ts`

4. **Hooks Dependentes**
   - Hooks que usam os stores migrados
   - Hooks com lógica de negócio complexa
   - Hooks de integração IPC

5. **Componentes por Domínio**
   - Componentes simples primeiro
   - Componentes complexos por último
   - Componentes shared para `shared/components/`

6. **Rotas e Navegação**
   - Rotas simples primeiro
   - Rotas com preload
   - Layouts e navegação complexa

### Validação Contínua

**A cada arquivo migrado:**

- Executar `npm run dev` para verificar funcionamento
- Testar funcionalidade específica do arquivo
- Verificar se não há erros de TypeScript
- Confirmar que integrações IPC funcionam
- Validar que a aplicação continua executando sem erros
