# Project Wiz: Fluxos de Funcionalidades Principais

**Versão:** 3.0  
**Status:** Design Final  
**Data:** 2025-01-17  

---

## 🎯 Visão Geral dos Fluxos

Este documento detalha os **fluxos completos das funcionalidades principais** do Project Wiz, desde a ação do usuário até a resposta do sistema, incluindo todas as camadas da aplicação.

---

## 🚀 Fluxo 1: Criar Novo Projeto

### Visão do Usuário
1. Clica no botão "+" na sidebar de projetos
2. Preenche formulário (nome, descrição, Git URL opcional)
3. Clica em "Create Project"
4. É redirecionado para o novo projeto

### Fluxo Técnico Completo

```mermaid
sequenceDiagram
    participant U as User
    participant UI as React UI
    participant IPC as IPC Layer
    participant API as Project API
    participant SVC as Project Service
    participant DB as Database
    participant GIT as Git Service
    participant EVT as Event Bus
    
    U->>UI: Click "Create Project"
    UI->>UI: Show modal form
    U->>UI: Fill form data
    UI->>UI: Validate input (Zod)
    UI->>IPC: api.projects.create(data)
    IPC->>API: Handle 'projects:create'
    API->>SVC: ProjectService.create(data)
    
    alt Git URL provided
        SVC->>GIT: GitService.cloneRepository(url)
        GIT-->>SVC: Repository cloned
    else No Git URL
        SVC->>GIT: GitService.initRepository()
        GIT-->>SVC: Empty repo created
    end
    
    SVC->>DB: Insert project record
    SVC->>DB: Create default channels
    DB-->>SVC: Success
    
    SVC->>EVT: Publish 'project.created'
    EVT-->>EVT: Notify listeners
    
    SVC-->>API: Return project
    API-->>IPC: Send response
    IPC-->>UI: Project created
    UI->>UI: Navigate to project
    UI-->>U: Show project page
```

### Código do Fluxo

```typescript
// Frontend: Create Project Form
function CreateProjectModal() {
  const { createProject } = useProjects();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (data: CreateProjectInput) => {
    setIsLoading(true);
    try {
      const project = await createProject(data);
      navigate(`/project/${project.id}`);
      toast.success('Project created successfully');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };
}

// Backend: Project Service
static async create(input: CreateProjectInput, ownerId: string): Promise<Project> {
  // 1. Validação
  const validated = CreateProjectSchema.parse(input);
  
  // 2. Verificar limites
  await this.validateProjectLimits(ownerId);
  
  // 3. Criar projeto
  const project = {
    id: generateId(),
    ...validated,
    ownerId,
    createdAt: new Date(),
  };
  
  // 4. Persistir
  await db.insert(projects).values(project);
  
  // 5. Criar canais padrão
  await this.createDefaultChannels(project.id, ownerId);
  
  // 6. Configurar Git
  if (validated.gitUrl) {
    await GitService.cloneRepository(project.id, validated.gitUrl);
  } else {
    await GitService.initRepository(project.id);
  }
  
  // 7. Publicar evento
  await EventBus.publish('project.created', { projectId: project.id });
  
  return project;
}
```

---

## 💬 Fluxo 2: Enviar Mensagem no Chat

### Visão do Usuário
1. Digita mensagem no chat input
2. Pressiona Enter ou clica Send
3. Vê a mensagem aparecer na lista
4. Agentes podem responder automaticamente

### Fluxo Técnico Completo

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Chat UI
    participant Store as Zustand Store
    participant IPC as IPC Layer
    participant API as Messages API
    participant SVC as Chat Service
    participant DB as Database
    participant Router as Message Router
    participant Agent as Agent Worker
    participant LLM as LLM Service
    
    U->>UI: Type message
    U->>UI: Press Enter
    UI->>Store: Add optimistic message
    UI->>IPC: api.messages.send(message)
    IPC->>API: Handle 'messages:send'
    API->>SVC: ChatService.sendMessage(data)
    
    SVC->>DB: Insert message
    DB-->>SVC: Message saved
    
    SVC->>Router: Analyze message intent
    Router->>LLM: LLMService.analyzeIntent()
    LLM-->>Router: Intent analysis
    
    alt Requires agent response
        Router->>Agent: Route to appropriate agent
        Agent->>Agent: Build context
        Agent->>LLM: Generate response
        LLM-->>Agent: AI response
        Agent->>SVC: Send agent message
        SVC->>DB: Save agent message
        SVC->>API: Broadcast new message
    end
    
    SVC-->>API: Return user message
    API-->>IPC: Send response
    IPC-->>Store: Update with server data
    Store-->>UI: Update message list
    UI-->>U: Show messages
```

### Código do Fluxo

```typescript
// Frontend: Chat Input
function ChatInput({ channelId }: { channelId: string }) {
  const [message, setMessage] = useState('');
  const { sendMessage } = useMessages(channelId);
  
  const handleSend = async () => {
    if (!message.trim()) return;
    
    // Optimistic update
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      content: message,
      channelId,
      authorId: currentUser.id,
      authorType: 'user',
      createdAt: new Date(),
    };
    
    addOptimisticMessage(optimisticMessage);
    setMessage('');
    
    try {
      const realMessage = await sendMessage(message);
      replaceOptimisticMessage(optimisticMessage.id, realMessage);
    } catch (error) {
      removeOptimisticMessage(optimisticMessage.id);
      toast.error('Failed to send message');
    }
  };
}

// Backend: Message Processing
static async processMessage(message: Message): Promise<void> {
  // Analisar intenção
  const intent = await LLMService.analyzeIntent(message.content);
  
  if (intent.requiresAgent) {
    // Encontrar agente apropriado
    const agent = await this.findAppropriateAgent(
      message.channelId!,
      intent.expertise
    );
    
    if (agent) {
      // Enviar para processamento do agente
      await AgentWorkerManager.sendMessage(agent.id, message);
    }
  }
  
  // Publicar evento de nova mensagem
  await EventBus.publish('message.sent', {
    messageId: message.id,
    channelId: message.channelId,
  });
}
```

---

## 🤖 Fluxo 3: Agente Executando Tarefa

### Visão do Usuário
1. Envia mensagem solicitando implementação
2. Vê resposta do agente confirmando
3. Acompanha progresso no canal
4. Recebe notificação quando completo

### Fluxo Técnico Completo

```mermaid
sequenceDiagram
    participant U as User
    participant Chat as Chat Channel
    participant Router as Message Router
    participant Agent as Agent Worker
    participant Queue as Task Queue
    participant Git as Git Worker
    participant LLM as LLM Service
    participant DB as Database
    
    U->>Chat: "Implement user authentication"
    Chat->>Router: Route message
    Router->>Agent: Assign to developer agent
    
    Agent->>LLM: Analyze request
    LLM-->>Agent: Task breakdown
    
    Agent->>Queue: Create implementation task
    Agent->>Chat: "I'll implement user authentication"
    
    Agent->>Agent: Process task from queue
    Agent->>Git: Create worktree
    Git-->>Agent: Worktree path
    
    Agent->>Agent: Analyze codebase
    Agent->>LLM: Generate implementation
    LLM-->>Agent: Code + tests
    
    Agent->>Git: Write files
    Agent->>Git: Run tests
    Git-->>Agent: Test results
    
    Agent->>Git: Commit changes
    Git-->>Agent: Commit hash
    
    Agent->>DB: Update task status
    Agent->>Chat: "✅ Implementation complete"
    Chat-->>U: Notification
```

### Código do Fluxo

```typescript
// Agent Worker: Task Execution
private async executeCodeTask(task: AgentTask): Promise<void> {
  // 1. Criar worktree isolado
  const worktreePath = await GitService.createWorktreeForTask(
    task.projectId!,
    task.id
  );
  
  // 2. Analisar código existente
  const codeContext = await this.analyzeCodebase(worktreePath);
  
  // 3. Gerar implementação com IA
  const implementation = await this.generateImplementation(task, codeContext);
  
  // 4. Escrever arquivos
  for (const file of implementation.files) {
    await fs.writeFile(
      path.join(worktreePath, file.path),
      file.content
    );
  }
  
  // 5. Executar testes
  const testResults = await this.runTests(worktreePath);
  
  // 6. Commit se testes passaram
  if (testResults.success) {
    await GitService.commitChanges(
      worktreePath,
      `feat: ${task.description}\n\nImplemented by ${this.agent.name}`
    );
    
    // 7. Reportar sucesso
    await this.reportTaskCompletion(task, {
      status: 'completed',
      testResults,
      files: implementation.files,
    });
  } else {
    // Reportar falha nos testes
    await this.reportTaskFailure(task, testResults);
  }
}
```

---

## 📋 Fluxo 4: Criar e Gerenciar Issues

### Visão do Usuário
1. Acessa o Kanban board do projeto
2. Clica em "Create Issue"
3. Preenche detalhes da issue
4. Arrasta issue entre colunas
5. Agente pode pegar a issue

### Fluxo Técnico Completo

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Kanban UI
    participant IPC as IPC Layer
    participant API as Issues API
    participant SVC as Issue Service
    participant DB as Database
    participant Agent as Agent Service
    participant Git as Git Service
    
    U->>UI: Click "Create Issue"
    UI->>UI: Show issue form
    U->>UI: Fill issue details
    UI->>IPC: api.issues.create(data)
    IPC->>API: Handle 'issues:create'
    API->>SVC: IssueService.create(data)
    
    SVC->>DB: Insert issue record
    DB-->>SVC: Issue created
    
    SVC->>Git: Create feature branch
    Git-->>SVC: Branch created
    
    SVC-->>API: Return issue
    API-->>IPC: Send response
    IPC-->>UI: Update kanban board
    
    U->>UI: Drag issue to "In Progress"
    UI->>IPC: api.issues.updateStatus(id, status)
    IPC->>API: Handle 'issues:update-status'
    API->>SVC: IssueService.updateStatus()
    
    alt Auto-assign to agent
        SVC->>Agent: Find available agent
        Agent-->>SVC: Agent selected
        SVC->>Agent: Assign issue
        Agent->>Agent: Create task from issue
    end
    
    SVC->>DB: Update issue status
    SVC-->>API: Return updated issue
    API-->>IPC: Send response
    IPC-->>UI: Update board
    UI-->>U: Show updated status
```

### Código do Fluxo

```typescript
// Frontend: Kanban Board
function KanbanBoard({ projectId }: { projectId: string }) {
  const { issues, moveIssue } = useIssues(projectId);
  
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const issue = issues.find(i => i.id === result.draggableId);
    if (!issue) return;
    
    // Optimistic update
    moveIssue(issue.id, result.destination.droppableId as IssueStatus);
    
    try {
      await api.issues.updateStatus(issue.id, result.destination.droppableId);
    } catch (error) {
      // Revert on error
      moveIssue(issue.id, issue.status);
      toast.error('Failed to update issue');
    }
  };
  
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="kanban-board">
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            issues={issues.filter(i => i.status === column.id)}
          />
        ))}
      </div>
    </DragDropContext>
  );
}

// Backend: Issue Service
static async updateStatus(
  issueId: string,
  newStatus: IssueStatus
): Promise<Issue> {
  const issue = await this.findById(issueId);
  if (!issue) throw new NotFoundError('Issue', issueId);
  
  const oldStatus = issue.status;
  
  // Atualizar status
  await db.update(issues)
    .set({ 
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(issues.id, issueId));
  
  // Se movendo para "In Progress", pode auto-atribuir
  if (newStatus === 'in_progress' && !issue.assigneeId) {
    await this.autoAssignToAgent(issueId);
  }
  
  // Registrar atividade
  await this.logActivity(issueId, 'status_change', {
    from: oldStatus,
    to: newStatus,
  });
  
  // Publicar evento
  await EventBus.publish('issue.status_changed', {
    issueId,
    oldStatus,
    newStatus,
  });
  
  return this.findById(issueId)!;
}
```

---

## 💬 Fluxo 5: Discussão no Fórum

### Visão do Usuário
1. Cria tópico de discussão
2. Descreve o problema/proposta
3. Agentes participam da discussão
4. Consenso gera documentação/issue

### Fluxo Técnico Completo

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Forum UI
    participant IPC as IPC Layer
    participant API as Forum API
    participant SVC as Forum Service
    participant DB as Database
    participant Agent as Agent Workers
    participant LLM as LLM Service
    
    U->>UI: Create new topic
    UI->>IPC: api.forum.createTopic(data)
    IPC->>API: Handle 'forum:create-topic'
    API->>SVC: ForumService.createTopic()
    
    SVC->>DB: Insert topic
    SVC->>Agent: Notify relevant agents
    
    loop Agent participation
        Agent->>LLM: Analyze topic
        LLM-->>Agent: Generate response
        Agent->>SVC: Post response
        SVC->>DB: Save post
        SVC->>UI: Broadcast new post
    end
    
    Agent->>Agent: Detect consensus
    Agent->>SVC: Generate summary
    SVC->>DB: Create documentation
    SVC->>API: Create related issue
    
    API-->>IPC: Updates
    IPC-->>UI: Update forum
    UI-->>U: Show discussion
```

### Código do Fluxo

```typescript
// Backend: Forum Discussion with Agents
static async processTopicForAgents(topic: ForumTopic): Promise<void> {
  // Encontrar agentes relevantes
  const relevantAgents = await this.findRelevantAgents(topic);
  
  for (const agent of relevantAgents) {
    // Notificar agente sobre novo tópico
    await AgentWorkerManager.notifyNewTopic(agent.id, topic);
  }
  
  // Agendar análise de consenso
  setTimeout(() => this.checkForConsensus(topic.id), 30 * 60 * 1000); // 30 min
}

static async checkForConsensus(topicId: string): Promise<void> {
  const posts = await this.getTopicPosts(topicId);
  
  if (posts.length < 3) return; // Precisa de discussão mínima
  
  // Usar IA para detectar consenso
  const consensus = await LLMService.analyzeConsensus(posts);
  
  if (consensus.reached) {
    // Gerar documentação
    const doc = await this.generateDocumentation(topicId, consensus);
    
    // Criar issue se necessário
    if (consensus.requiresImplementation) {
      await IssueService.createFromForum({
        title: consensus.title,
        description: consensus.summary,
        topicId,
      });
    }
    
    // Marcar tópico como resolvido
    await this.updateTopicStatus(topicId, 'resolved');
  }
}
```

---

## 🔄 Fluxo 6: Troca de Conta

### Visão do Usuário
1. Clica no menu de usuário
2. Seleciona "Switch Account"
3. Escolhe outra conta
4. Interface recarrega com nova conta

### Fluxo Técnico Completo

```mermaid
sequenceDiagram
    participant U as User
    participant UI as React UI
    participant Store as Auth Store
    participant IPC as IPC Layer
    participant API as Auth API
    participant SVC as Auth Service
    participant DB as Database
    
    U->>UI: Click user menu
    UI->>UI: Show account options
    U->>UI: Click "Switch Account"
    
    UI->>Store: Clear current auth
    Store->>Store: Remove token
    Store->>IPC: api.auth.listAccounts()
    IPC->>API: Handle 'auth:list-accounts'
    API->>SVC: AuthService.listAccounts()
    SVC->>DB: Query active users
    DB-->>SVC: User list
    SVC-->>API: Return accounts
    API-->>IPC: Send response
    IPC-->>Store: Update available accounts
    Store-->>UI: Show account selector
    
    U->>UI: Select account
    UI->>UI: Navigate to login
    UI-->>U: Pre-fill username
```

---

## 🎯 Padrões nos Fluxos

### Comunicação em Camadas
1. **UI** → Validação local → Optimistic updates
2. **IPC** → Type-safe bridge → Error serialization
3. **API** → Input validation → Service delegation
4. **Service** → Business logic → Event publishing
5. **Database** → Atomic operations → Consistency

### Tratamento de Erros
- Validação em múltiplas camadas
- Rollback de optimistic updates
- User-friendly error messages
- Logging para debugging

### Performance
- Optimistic updates no frontend
- Lazy loading de dados
- Background processing para tarefas pesadas
- Caching com TanStack Query

### Segurança
- Validação de entrada em todas as camadas
- Autenticação verificada no backend
- Permissões verificadas por operação
- Dados sensíveis nunca expostos

---

## 📈 Benefícios dos Fluxos

### ✅ User Experience
- **Feedback imediato** com optimistic updates
- **Operações assíncronas** não bloqueiam UI
- **Notificações claras** de progresso
- **Recovery automático** de erros

### ✅ Developer Experience  
- **Fluxos previsíveis** e debugáveis
- **Type safety** end-to-end
- **Separation of concerns** clara
- **Testabilidade** em cada camada

### ✅ Scalability
- **Background workers** para tarefas pesadas
- **Event-driven** architecture
- **Modular design** permite extensão
- **Performance** otimizada por design

---

*Estes fluxos representam as interações principais do Project Wiz, demonstrando como a arquitetura suporta operações complexas mantendo simplicidade e clareza.*