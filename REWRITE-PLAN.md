# Project Wiz: Plano de Reescrita Completa

**Versão:** 1.0  
**Data:** 2025-01-18  
**Status:** Aprovado para Implementação  

---

## 🎯 Objetivo Geral

Reescrever completamente o **Project Wiz** seguindo a nova arquitetura simplificada especificada em `docs/architecture/`, transformando de uma aplicação complexa baseada em domínios DDD para uma aplicação **KISS (Keep It Simple, Stupid)** com interface Discord-like.

## 📊 Análise do Estado Atual vs. Novo Design

### **Estado Atual (Complexo)**
- ✅ Arquitetura DDD com Object Calisthenics
- ✅ Entidades ricas com value objects anêmicos
- ✅ Múltiplas stores distribuídas por domínio
- ✅ Layout proprietário complexo
- ✅ Estrutura deeply nested
- ✅ Dependency injection complexa

### **Novo Design (Simplificado)**
- 🎯 Arquitetura KISS com funções simples
- 🎯 Domain functions diretas sem over-engineering
- 🎯 Estado centralizado (Zustand + TanStack Query)
- 🎯 Interface Discord-like familiar
- 🎯 Estrutura flat e intuitiva
- 🎯 Infraestrutura transparente

---

## 🚀 Plano de Implementação

### **Fase 1: Nova Estrutura Base (2-3 dias)**

#### **1.1 Backup e Preparação**
- [ ] Criar backup completo do código atual
- [ ] Criar branch `rewrite-v3` para nova implementação
- [ ] Documentar dependências atuais para migração

#### **1.2 Nova Estrutura de Diretórios**
Seguindo `docs/architecture/FILE-STRUCTURE.md`:

```
src/
├── main/                    # Backend (Node.js/Electron)
│   ├── user/               # Bounded Context: User
│   │   ├── authentication/ # Aggregate: Authentication
│   │   ├── profile/        # Aggregate: Profile  
│   │   └── direct-messages/# Aggregate: Direct Messages
│   ├── project/            # Bounded Context: Project
│   │   ├── channels/       # Aggregate: Channels
│   │   ├── members/        # Aggregate: Members
│   │   ├── forums/         # Aggregate: Forums
│   │   ├── issues/         # Aggregate: Issues
│   │   └── core/           # Core project
│   ├── conversations/      # Bounded Context: Conversations
│   │   ├── channels/       # Aggregate: Channel Chat
│   │   ├── direct-messages/# Aggregate: DM Chat
│   │   ├── routing/        # Aggregate: Message Routing
│   │   └── core/           # Core conversations
│   ├── agents/             # Bounded Context: Agents
│   │   ├── worker/         # Aggregate: Worker
│   │   └── queue/          # Aggregate: Queue
│   ├── database/           # Data Layer (Drizzle ORM)
│   ├── utils/              # Backend utilities
│   └── main.ts             # Entry point
├── renderer/                # Frontend (React)
│   ├── app/                # Routes (TanStack Router)
│   ├── features/           # Features organizadas por domínio
│   ├── components/         # Componentes compartilhados
│   ├── hooks/              # Hooks globais/compartilhados
│   ├── store/              # Estado global
│   └── utils/              # Utilities (flat)
└── shared/                 # Código compartilhado
    ├── types/              # TypeScript Types
    ├── constants/          # Constantes globais
    └── utils/              # Utilitários compartilhados
```

#### **1.3 Database Schema com Drizzle ORM**
Implementar schema completo seguindo `docs/architecture/DATABASE-SCHEMA.md`:

- **Users Schema** - Autenticação multi-conta local
- **Agents Schema** - Agentes globais por usuário
- **Projects Schema** - Projetos como servidores Discord
- **Channels Schema** - Canais de texto por projeto
- **Messages Schema** - Mensagens unificadas (canais + DMs)
- **DM Conversations Schema** - Conversas diretas user-agent
- **Forum Schema** - Tópicos e posts estruturados
- **Issues Schema** - Sistema Kanban com Git integration
- **Relationships Schema** - Junction tables

#### **1.4 Configuração da Nova Stack**

**Frontend:**
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "@tanstack/react-router": "^1.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.0.0",
    "@radix-ui/react-*": "latest",
    "tailwindcss": "^3.0.0",
    "zod": "^3.0.0"
  }
}
```

**Backend:**
```json
{
  "dependencies": {
    "drizzle-orm": "^0.33.0",
    "better-sqlite3": "^11.0.0",
    "@ai-sdk/openai": "^0.0.66",
    "@ai-sdk/deepseek": "^0.0.15",
    "bcryptjs": "^2.4.3"
  }
}
```

#### **1.5 Sistema de Autenticação Multi-conta**
Seguindo `docs/architecture/AUTHENTICATION.md`:

- **Login local simples** sem servidor externo
- **Múltiplas contas** no mesmo dispositivo
- **Troca rápida** entre usuários
- **Dados isolados** por conta
- **Sessões persistentes** com JWT local

---

### **Fase 2: Backend Simplificado (3-4 dias)**

#### **2.1 Nova Camada de Serviços**
Seguindo `docs/architecture/BUSINESS-LOGIC.md`:

**Padrão de Service Simplificado:**
```typescript
// Domain functions simples ao invés de classes complexas
export async function createProject(input: CreateProjectInput): Promise<Project> {
  // 1. Validação com Zod
  const validated = CreateProjectSchema.parse(input);
  
  // 2. Regras de negócio simples
  await validateProjectBusinessRules(validated);
  
  // 3. Operação no banco
  const db = getDatabase();
  const project = await db.insert(projects).values({
    id: generateId(),
    ...validated,
    createdAt: new Date(),
  }).returning();
  
  // 4. Eventos
  publishEvent('project.created', project[0]);
  
  return project[0];
}
```

**Services por Domínio:**
- `user-service.ts` - Gestão de usuários
- `agent-service.ts` - Lógica de agentes IA
- `project-service.ts` - Gestão de projetos
- `channel-service.ts` - Canais de comunicação
- `chat-service.ts` - Sistema de chat
- `forum-service.ts` - Fóruns de discussão
- `issue-service.ts` - Sistema de issues
- `git-service.ts` - Integração Git

#### **2.2 APIs IPC Simplificadas**
Seguindo `docs/architecture/API-SPECIFICATION.md`:

**Padrão IPC KISS:**
```typescript
// Convenção: {domain}:{action}
"users:create"
"projects:create"
"agents:list"
"messages:send"
```

**Type-Safe APIs:**
```typescript
interface ProjectsAPI {
  create(input: CreateProjectInput): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findByUser(userId: string): Promise<Project[]>;
  update(id: string, input: UpdateProjectInput): Promise<Project>;
  delete(id: string): Promise<void>;
}
```

#### **2.3 Sistema de Agentes Workers**
Seguindo `docs/architecture/AGENT-WORKERS.md`:

- **Agentes background** independentes
- **Especializados por expertise** (frontend, backend, design, testing)
- **Trabalho paralelo** com Git worktrees
- **Comunicação via DMs** e canais
- **Integração LLM** para IA (OpenAI, DeepSeek)

#### **2.4 Integração Git com Worktrees**
- **Repositório principal** clonado para projeto
- **Worktrees automáticos** por issue/agente
- **Branches independentes** por tarefa
- **Commits automatizados** pelos agentes
- **Merge/PR** coordenado

---

### **Fase 3: Frontend Discord-like (4-5 dias)**

#### **3.1 Interface Discord-like**
Seguindo `docs/architecture/UI-COMPONENTS.md`:

**Layout Principal:**
```
┌────┬──────────────┬─────────────────────────────────┬────────┐
│    │              │                                 │        │
│ P  │   CANAIS     │      ÁREA DE CONTEÚDO          │ MEMBROS│
│ R  │              │                                 │        │
│ O  │ #general     │  ┌─────────────────────────────┐ │ Agents │
│ J  │ #frontend    │  │                             │ │        │
│ E  │ #backend     │  │    CHAT AREA (Canais)      │ │ • Alex │
│ T  │              │  │    ou                       │ │ • Bot  │
│ O  │ ──────────   │  │    CONTEÚDO ESPECÍFICO      │ │        │
│ S  │              │  │    (Issues, Fórum, etc)    │ │ Users  │
│    │ 📋 ISSUES    │  │                             │ │        │
│    │ 💬 FORUM     │  └─────────────────────────────┘ │ • User │
│    │ ⚙️  CONFIG   │                                 │        │
│    │              │  [CHAT INPUT - apenas em canais]│        │
└────┴──────────────┴─────────────────────────────────┴────────┘
```

**Componentes Principais:**
- `DiscordLayout` - Layout base estilo Discord
- `ProjectSidebar` - Lista de projetos (servidores)
- `ChannelSidebar` - Canais, issues, fórum do projeto
- `ChatArea` - Área de chat dinâmica
- `MemberSidebar` - Agentes e usuários do projeto

#### **3.2 Sistema de Roteamento**
Seguindo `docs/architecture/ROUTING-SYSTEM.md`:

**TanStack Router File-based:**
```
app/
├── __root.tsx              # Global root layout
├── index.tsx               # Home page
├── login.tsx               # Login page
├── user/                   # User área routes
│   ├── route.tsx           # User área layout
│   ├── index.tsx           # Personal dashboard
│   ├── direct-messages/    # DM routes
│   └── settings/           # Personal settings
└── project/                # Project área routes
    ├── route.tsx           # Project layout (Discord-like)
    └── [project-id]/       # Specific project
        ├── index.tsx       # Project overview
        ├── channel/[channel-id]/
        ├── forum/[topic-id]/
        ├── issues/[issue-id]/
        └── settings/
```

#### **3.3 Componentes de Chat**
- **ChatArea** - Área principal de mensagens
- **MessageList** - Lista de mensagens com virtualização
- **MessageItem** - Item individual de mensagem
- **ChatInput** - Input de mensagem com features
- **TypingIndicator** - Indicador de digitação
- **EmojiPicker** - Seletor de emojis

#### **3.4 Sistema de Fóruns e Issues**
- **ForumView** - Lista de tópicos estruturados
- **TopicThread** - Thread de discussão
- **KanbanBoard** - Board Kanban para issues
- **IssueCard** - Card de issue arrastável
- **IssueDetail** - Detalhes da issue com comentários

---

### **Fase 4: Integração e Testes (2-3 dias)**

#### **4.1 Estratégia de Testes**
Seguindo `docs/architecture/TESTING-STRATEGY.md`:

**Distribuição:**
- **70% Unit Tests** - Services, functions, components
- **20% Integration Tests** - Database, IPC, fluxos
- **10% E2E Tests** - Cenários críticos de usuário

**Configuração:**
```typescript
// vitest.config.mts
export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      thresholds: {
        global: { branches: 80, functions: 80, lines: 80 }
      }
    }
  }
});
```

#### **4.2 Quality Gates e CI/CD**
```bash
# Quality pipeline
npm run test:coverage    # Unit + coverage
npm run test:integration # Integration tests  
npm run lint            # ESLint + Prettier
npm run type-check      # TypeScript
npm run test:e2e        # E2E tests (CI only)
```

#### **4.3 Migração de Dados**
- **Análise de dados** existentes no banco atual
- **Scripts de migração** para novo schema
- **Validação** de integridade dos dados
- **Rollback plan** se necessário

#### **4.4 Testes de Integração**
- **Fluxos completos** de funcionalidades
- **Comunicação IPC** main ↔ renderer
- **Database operations** com transactions
- **Agent workers** end-to-end

---

### **Fase 5: Documentação Atualizada (1-2 dias)**

#### **5.1 Atualizar CLAUDE.md**
- **Nova arquitetura** completa
- **Stack tecnológica** atualizada
- **Padrões de desenvolvimento** KISS
- **Comandos** e workflows atualizados

#### **5.2 Documentação de Developer**
- **Getting Started** atualizado
- **Architecture Guide** revisado
- **API Reference** completo
- **Contributing Guide** simplificado

#### **5.3 Guias de Migração**
- **Migration Guide** da versão anterior
- **Breaking Changes** documentadas
- **Update Instructions** step-by-step
- **Troubleshooting** comum

---

## 🔄 Principais Transformações

### **1. Arquitetura: De DDD Complexo para KISS**

**Antes (Complexo):**
```typescript
// Object Calisthenics com entidades ricas
export class Agent {
  constructor(
    private readonly identity: AgentIdentity,
    private readonly configuration: AgentConfiguration,
    private readonly runtime: AgentRuntime,
  ) {}
  
  public startWork(): void {
    if (!this.canStartWork()) {
      throw new Error(`Agent ${this.identity.getValue()} cannot start work`);
    }
    this.runtime.updateStatus("working");
  }
}
```

**Depois (Simples):**
```typescript
// Funções simples e diretas
export async function startAgent(agentId: string): Promise<void> {
  const agent = await findAgentById(agentId);
  if (!agent) {
    throw new Error(`Agent ${agentId} not found`);
  }
  
  if (agent.status !== 'online') {
    throw new Error(`Agent ${agentId} is not available`);
  }
  
  await updateAgentStatus(agentId, 'working');
  await AgentWorker.start(agentId);
}
```

### **2. Interface: De Layout Personalizado para Discord-like**

**Antes:** Layout proprietário complexo com navegação custom  
**Depois:** Interface familiar estilo Discord que desenvolvedores já conhecem

### **3. Database: De Múltiplos Schemas para Schema Unificado**

**Antes:** Schemas distribuídos por domínio com relacionamentos complexos  
**Depois:** Schema centralizado otimizado com Drizzle ORM type-safe

### **4. Estado: De Stores Distribuídas para Gestão Centralizada**

**Antes:**
```typescript
// Múltiplas stores por domínio
const agentStore = useAgentStore();
const projectStore = useProjectStore();
const userStore = useUserStore();
```

**Depois:**
```typescript
// Estado centralizado simples
const { projects } = useAppStore();
const { data: agents } = useQuery(['agents'], getAgents);
```

---

## 📈 Cronograma Detalhado

### **Semana 1: Base (Dias 1-5)**
- **Dia 1**: Backup + Nova estrutura de diretórios
- **Dia 2**: Database schema + Configuração stack
- **Dia 3**: Sistema de autenticação multi-conta
- **Dia 4**: Services layer (user, project, agent)
- **Dia 5**: APIs IPC básicas

### **Semana 2: Frontend (Dias 6-10)**
- **Dia 6**: Layout Discord-like + Routing
- **Dia 7**: Componentes de chat + Mensagens
- **Dia 8**: Fórums + Issues Kanban
- **Dia 9**: Agent workers + Git integration
- **Dia 10**: Integração frontend-backend

### **Semana 3: Finalização (Dias 11-15)**
- **Dia 11**: Testes unitários + Integration
- **Dia 12**: E2E tests + Quality gates
- **Dia 13**: Migração de dados + Validação
- **Dia 14**: Documentação atualizada
- **Dia 15**: Polimento + Deploy final

---

## 🎯 Critérios de Sucesso

### **Funcionalidades Essenciais**
- ✅ **Login multi-conta** funcionando
- ✅ **Interface Discord-like** responsiva
- ✅ **Chat em tempo real** user ↔ agents
- ✅ **Projetos como servidores** com canais
- ✅ **Agentes autônomos** respondendo
- ✅ **Fórums estruturados** para discussões
- ✅ **Issues Kanban** com Git integration

### **Qualidade de Código**
- ✅ **80%+ test coverage** em componentes críticos
- ✅ **Zero ESLint errors** em todo o código
- ✅ **Type-safe** completo com TypeScript
- ✅ **Performance** adequada (< 3s load time)

### **Developer Experience**
- ✅ **Documentação completa** e atualizada
- ✅ **Setup simples** (< 5 min para começar)
- ✅ **Hot reload** funcionando perfeitamente
- ✅ **Debug tools** configurados

---

## ⚠️ Riscos e Mitigações

### **Risco 1: Perda de Dados Durante Migração**
**Mitigação:** Backup completo + scripts de migração testados + rollback plan

### **Risco 2: Performance com SQLite**
**Mitigação:** Índices otimizados + WAL mode + queries eficientes

### **Risco 3: Complexidade dos Agent Workers**
**Mitigação:** Implementação incremental + testes isolados + fallbacks

### **Risco 4: Incompatibilidade de Dependências**
**Mitigação:** Versões LTS + testes de compatibilidade + lockfile

---

## 📋 Checklist Final

### **Antes do Deploy**
- [ ] **Todos os testes** passando (unit + integration + e2e)
- [ ] **Coverage mínimo** de 80% atingido
- [ ] **Zero ESLint errors** em todo o código
- [ ] **TypeScript strict** mode sem erros
- [ ] **Performance** validada (< 3s load, < 100ms interactions)
- [ ] **Documentação** completa e atualizada
- [ ] **Backup** do sistema anterior criado
- [ ] **Migration scripts** testados e validados

### **Pós-Deploy**
- [ ] **Smoke tests** em produção
- [ ] **User feedback** coletado
- [ ] **Performance monitoring** configurado
- [ ] **Error tracking** ativo
- [ ] **Rollback plan** documentado e testado

---

## 🚀 Próximos Passos (Pós-Reescrita)

### **Melhorias Futuras**
1. **Real-time collaboration** com WebSockets
2. **Voice channels** para comunicação
3. **Plugin system** para extensibilidade
4. **Advanced AI features** (code review, auto-fix)
5. **Multi-repository** support
6. **Team collaboration** features
7. **Advanced Git workflows** (PR automation)
8. **Performance optimizations** (virtualization, caching)

### **Community Features**
1. **Public projects** sharing
2. **Agent marketplace** 
3. **Template gallery**
4. **Community plugins**

---

**Este plano representa uma transformação completa do Project Wiz, seguindo rigorosamente as especificações da nova arquitetura documentada em `docs/architecture/`. O resultado será uma aplicação mais simples, mais familiar para desenvolvedores, e muito mais maintível a longo prazo.**