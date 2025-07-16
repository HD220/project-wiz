# Refatoração e Reorganização do Renderer - Casos de Uso

## Visão Geral

Este documento define os casos de uso para a refatoração completa do renderer, detalhando como cada aspecto da migração arquitetural deve ser executado seguindo Object Calisthenics e padrões de Clean Code.

## Casos de Uso por Categoria

### UC01 - Migração de Stores

#### UC01.1 - Simplificar Store Monolítico

**Ator:** Desenvolvedor
**Objetivo:** Decompor store monolítico em stores especializados usando Zustand slim + TanStack Query

**Pré-condições:**

- Store atual > 50 linhas (violação Object Calisthenics)
- Múltiplas responsabilidades identificadas
- Handlers IPC funcionando no backend

**Fluxo Principal:**

1. Identificar responsabilidades do store atual
2. Extrair estado local para Zustand slim (≤50 linhas)
3. Migrar operações de backend para TanStack Query
4. Criar hooks especializados para cada responsabilidade
5. Atualizar componentes para usar novos hooks
6. Validar funcionalidade completa
7. Remover store antigo

**Pós-condições:**

- Store Zustand ≤ 50 linhas
- Hooks TanStack Query implementados
- Separação clara de responsabilidades
- Funcionalidade mantida 100%

**Exemplo de Transformação:**

```typescript
// ANTES: channel-message.store.ts (343 linhas - ARQUIVO REAL IDENTIFICADO)
class ChannelMessageStore {
  private state: ChannelMessageStoreState = {
    messagesByChannel: Record<string, ChannelMessageDto[]>,
    isLoading: boolean,
    error: string | null,
    selectedMessage: ChannelMessageDto | null,
    isLoadingMore: boolean,
  };

  loadMessagesByChannel = async (channelId: string) => {
    // 38 linhas de lógica complexa - VIOLAÇÃO Object Calisthenics
  };

  sendMessage = async (channelId: string, content: string) => {
    // 25 linhas de lógica complexa - VIOLAÇÃO Object Calisthenics
  };
}

// DEPOIS: Decomposição em stores especializados
// domains/projects/stores/channel-message.store.ts
interface ChannelMessageState {
  selectedMessage: ChannelMessageDto | null;
  setSelectedMessage: (message: ChannelMessageDto | null) => void;
}

const useChannelMessageStore = create<ChannelMessageState>((set) => ({
  selectedMessage: null,
  setSelectedMessage: (message) => set({ selectedMessage: message }),
}));

// domains/projects/hooks/use-channel-messages.hook.ts
export const useChannelMessages = (channelId: string) => {
  return useQuery({
    queryKey: ["channel-messages", channelId],
    queryFn: () => window.electronIPC.channelMessages.list({ channelId }),
    enabled: !!channelId,
  });
};

// domains/projects/hooks/use-send-message.hook.ts
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ channelId, content }: SendMessageDto) => {
      return window.electronIPC.channelMessages.create({
        channelId,
        content,
        senderId: "current-user-id",
      });
    },
    onSuccess: (_, { channelId }) => {
      queryClient.invalidateQueries({
        queryKey: ["channel-messages", channelId],
      });
    },
  });
};
```

#### UC01.2 - Migração de State Management

**Ator:** Desenvolvedor
**Objetivo:** Migrar de classe store para padrão funcional

**Pré-condições:**

- Store implementado como classe
- Violações Object Calisthenics identificadas

**Fluxo Principal:**

1. Identificar estado que permanece no cliente (seleções, UI state)
2. Identificar operações que vão para TanStack Query (backend data)
3. Criar interface Zustand com máximo 2 propriedades
4. Implementar hooks de Query para operações de backend
5. Testar integração completa
6. Remover implementação de classe

**Fluxo Alternativo:**

- Se store tem apenas operações de backend → usar apenas TanStack Query
- Se store tem apenas estado local → usar apenas Zustand

### UC02 - Decomposição de Componentes

#### UC02.1 - Quebrar Componente Monolítico

**Ator:** Desenvolvedor
**Objetivo:** Decompor componente > 50 linhas em micro-componentes

**Pré-condições:**

- Componente > 50 linhas (violação Object Calisthenics)
- Múltiplas responsabilidades identificadas
- Funcionalidade bem definida

**Fluxo Principal:**

1. Identificar responsabilidades do componente
2. Extrair lógica para hooks customizados
3. Criar componentes especializados (≤50 linhas)
4. Implementar composição de componentes
5. Aplicar padrão Container/Presentation
6. Validar funcionalidade e UI
7. Remover componente antigo

**Pós-condições:**

- Componentes ≤ 50 linhas cada
- Lógica extraída para hooks
- Responsabilidades bem definidas
- UI/UX mantidos idênticos

**Exemplo de Transformação:**

```typescript
// ANTES: conversation-view.tsx (249 linhas)
export function ConversationView({ conversationId, conversation }) {
  // Estado local misturado
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Lógica de scroll misturada
  useEffect(() => {
    // 15 linhas de lógica de scroll
  }, [messages, isTyping]);

  // Handler de envio misturado
  const handleSend = async (e: React.FormEvent) => {
    // 15 linhas de lógica de envio
  };

  // Renderização complexa
  return (
    <div className="conversation-view">
      {/* 200+ linhas de JSX complexo */}
    </div>
  );
}

// DEPOIS: Decomposição em micro-componentes
// domains/users/components/conversation-view.tsx (≤50 linhas)
export function ConversationView({ conversationId }: ConversationViewProps) {
  const conversation = useConversation(conversationId);

  if (!conversation) return <ConversationSkeleton />;

  return (
    <ConversationContainer>
      <ConversationHeader conversation={conversation} />
      <MessageList conversationId={conversationId} />
      <TypingIndicator conversationId={conversationId} />
      <MessageInput
        conversationId={conversationId}
        onSend={handleSendMessage}
      />
    </ConversationContainer>
  );
}

// domains/users/components/message-list.tsx (≤50 linhas)
export function MessageList({ conversationId }: MessageListProps) {
  const { data: messages } = useMessages(conversationId);
  const { scrollRef } = useAutoScroll(messages);

  return (
    <div ref={scrollRef} className="message-list">
      {messages?.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
}

// domains/users/components/message-input.tsx (≤50 linhas)
export function MessageInput({ conversationId, onSend }: MessageInputProps) {
  const { register, handleSubmit, reset } = useForm<SendMessageForm>();
  const sendMessage = useSendMessage();

  const handleSendMessage = async (data: SendMessageForm) => {
    await sendMessage.mutateAsync({
      conversationId,
      content: data.content,
    });
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleSendMessage)}>
      <input {...register('content')} />
      <button type="submit">Send</button>
    </form>
  );
}

// domains/users/hooks/use-auto-scroll.hook.ts
export const useAutoScroll = (messages: MessageDto[]) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return { scrollRef };
};
```

#### UC02.2 - Extrair Lógica para Hooks

**Ator:** Desenvolvedor
**Objetivo:** Extrair lógica de componentes para hooks reutilizáveis

**Pré-condições:**

- Componente com lógica complexa
- Lógica reutilizável identificada

**Fluxo Principal:**

1. Identificar lógica que pode ser extraída
2. Criar hook customizado single-purpose
3. Implementar hook com máximo 10 linhas por função
4. Testar hook isoladamente
5. Integrar hook no componente
6. Validar funcionalidade

### UC03 - Reorganização Estrutural

#### UC03.1 - Migrar Feature para Domínio

**Ator:** Desenvolvedor
**Objetivo:** Migrar feature da estrutura antiga para nova estrutura de domínios

**Pré-condições:**

- Feature na estrutura antiga (`src/renderer/features/`)
- Domínio correspondente identificado
- Handlers IPC funcionando

**Fluxo Principal:**

1. Identificar domínio de destino
2. Criar estrutura de pastas no domínio
3. Migrar componentes aplicando Object Calisthenics
4. Migrar hooks aplicando single-purpose
5. Migrar stores aplicando Zustand slim
6. Atualizar imports e exports
7. Validar funcionalidade completa
8. Remover feature antiga

**Pós-condições:**

- Arquivo na nova estrutura de domínios
- Object Calisthenics aplicado
- Funcionalidade mantida 100%
- Imports atualizados

**Mapeamento de Migração:**

```
features/agent-management/     → domains/agents/
features/project-management/   → domains/projects/
features/channel-messaging/    → domains/projects/ (consolidação)
features/communication/        → domains/projects/ (consolidação)
features/direct-messages/      → domains/users/
features/user-management/      → domains/users/ (consolidação)
features/llm-provider-management/ → domains/llm/
features/task-management/      → domains/projects/ (consolidação)
features/development-tools/    → domains/projects/ (consolidação)
```

#### UC03.2 - Consolidar Features Relacionadas

**Ator:** Desenvolvedor
**Objetivo:** Consolidar múltiplas features em um único domínio

**Pré-condições:**

- Features relacionadas identificadas
- Domínio de destino definido

**Fluxo Principal:**

1. Identificar features que pertencem ao mesmo domínio
2. Criar estrutura unificada no domínio
3. Migrar componentes removendo duplicação
4. Migrar hooks consolidando funcionalidades
5. Unificar stores relacionados
6. Eliminar código duplicado
7. Validar integração completa
8. Remover features antigas

**Exemplo de Consolidação:**

```typescript
// ANTES: 3 features separadas
features / channel - messaging / stores / channel - message.store.ts;
features / communication / stores / channel.store.ts;
features / project - management / stores / project.store.ts;

// DEPOIS: Domínio unificado
domains / projects / stores / project.store.ts;
domains / projects / stores / channel.store.ts;
domains / projects / stores / message.store.ts;

// Com shared hooks
domains / projects / hooks / use - project - data.hook.ts;
domains / projects / hooks / use - channel - data.hook.ts;
domains / projects / hooks / use - message - data.hook.ts;
```

### UC04 - Padronização IPC

#### UC04.1 - Migrar para API Tipada

**Ator:** Desenvolvedor
**Objetivo:** Migrar de API legacy para API tipada

**Pré-condições:**

- Código usando `window.electronIPC.invoke()` legacy
- API tipada disponível no preload

**Fluxo Principal:**

1. Identificar calls legacy no código
2. Mapear para API tipada correspondente
3. Atualizar calls para `window.electronIPC.domain.method()`
4. Validar tipos na compilação
5. Testar funcionalidade
6. Remover código legacy

**Pós-condições:**

- 100% uso de API tipada
- Eliminação de calls legacy
- Type safety completa
- Funcionalidade mantida

**Exemplo de Migração:**

```typescript
// ANTES: API legacy
const agents = await window.electronIPC.invoke("agent:list");
const newAgent = await window.electronIPC.invoke("agent:create", agentData);

// DEPOIS: API tipada
const agents = await window.electronIPC.agents.list();
const newAgent = await window.electronIPC.agents.create(agentData);
```

#### UC04.2 - Padronizar Error Handling

**Ator:** Desenvolvedor
**Objetivo:** Implementar error handling consistente

**Pré-condições:**

- Error handling inconsistente entre features
- Padrões de erro definidos

**Fluxo Principal:**

1. Identificar padrões de erro inconsistentes
2. Implementar error boundaries padronizados
3. Padronizar tratamento em hooks
4. Implementar fallbacks consistentes
5. Validar experiência do usuário
6. Documentar padrões

### UC05 - Otimização de Rotas

#### UC05.1 - Reorganizar Rotas por Domínio

**Ator:** Desenvolvedor
**Objetivo:** Reorganizar rotas seguindo estrutura de domínios

**Pré-condições:**

- Rotas na estrutura antiga
- Domínios bem definidos

**Fluxo Principal:**

1. Mapear rotas para domínios
2. Criar nova estrutura de rotas
3. Implementar layouts por domínio
4. Configurar preload otimizado
5. Migrar components de rotas
6. Validar navegação
7. Remover rotas antigas

**Pós-condições:**

- Rotas organizadas por domínio
- Preload otimizado implementado
- Navegação funcionando
- Code splitting configurado

#### UC05.2 - Implementar Code Splitting

**Ator:** Desenvolvedor
**Objetivo:** Implementar code splitting por domínio

**Pré-condições:**

- Rotas organizadas por domínio
- TanStack Router configurado

**Fluxo Principal:**

1. Configurar lazy loading por domínio
2. Implementar preload para rotas críticas
3. Configurar fallbacks de loading
4. Validar bundle size
5. Testar performance
6. Otimizar conforme necessário

## Casos de Uso de Exceção

### UCE01 - Falha na Migração

**Cenário:** Migração de arquivo resulta em funcionalidade quebrada

**Ações:**

1. Identificar causa da falha
2. Reverter para versão anterior
3. Analisar problemas de integração
4. Corrigir issues identificados
5. Repetir migração

### UCE02 - Problemas de Performance

**Cenário:** Refatoração resulta em degradação de performance

**Ações:**

1. Identificar bottlenecks
2. Implementar otimizações
3. Considerar estratégias alternativas
4. Validar melhorias
5. Documentar soluções

### UCE03 - Violação de Type Safety

**Cenário:** Migração resulta em erros de TypeScript

**Ações:**

1. Identificar tipos incompatíveis
2. Atualizar definições de tipos
3. Corrigir implementações
4. Validar compilação
5. Testar funcionalidade

## Critérios de Validação

### Por Caso de Uso

**UC01 - Migração de Stores:**

- ✅ Store ≤ 50 linhas
- ✅ Responsabilidades separadas
- ✅ TanStack Query integrado
- ✅ Funcionalidade mantida

**UC02 - Decomposição de Componentes:**

- ✅ Componentes ≤ 50 linhas
- ✅ Lógica extraída para hooks
- ✅ UI/UX mantidos
- ✅ Responsabilidade única

**UC03 - Reorganização Estrutural:**

- ✅ Arquivo na nova estrutura
- ✅ Object Calisthenics aplicado
- ✅ Imports atualizados
- ✅ Funcionalidade mantida

**UC04 - Padronização IPC:**

- ✅ API tipada utilizada
- ✅ Error handling consistente
- ✅ Type safety completa
- ✅ Funcionalidade mantida

**UC05 - Otimização de Rotas:**

- ✅ Rotas organizadas por domínio
- ✅ Preload implementado
- ✅ Code splitting configurado
- ✅ Performance mantida

## Considerações Especiais

### Ordem de Execução

1. **Infraestrutura:** Setup TanStack Query, estrutura de domínios
2. **Stores:** Migração de stores críticos primeiro
3. **Hooks:** Migração de hooks dependentes
4. **Componentes:** Decomposição por ordem de complexidade
5. **Rotas:** Reorganização e otimização
6. **IPC:** Padronização e cleanup

### Validação Contínua

- Validação funcional após cada migração
- Testes de integração IPC
- Verificação de performance
- Confirmação de type safety

### Rollback Strategy

- Manter backup do arquivo original
- Possibilidade de reverter migração específica
- Validação antes de remoção final
- Documentação de problemas encontrados
