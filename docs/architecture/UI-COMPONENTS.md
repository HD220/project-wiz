# Project Wiz: Interface Discord-like e Sistema de Componentes

**Versão:** 3.0  
**Status:** Design Final  
**Data:** 2025-01-17

---

## 🎯 Visão Geral da Interface

O Project Wiz implementa uma interface que **replica fielmente a experiência do Discord** mas adaptada para desenvolvimento de software colaborativo. A interface é construída com:

1. **React 19** - Framework UI moderno
2. **TailwindCSS** - Styling utility-first
3. **shadcn/ui** - Component library base
4. **TanStack Router** - Roteamento type-safe
5. **Zustand** - State management
6. **TanStack Query** - Server state

---

## 🎨 Layout Discord-like

### Estrutura Visual

```
┌─────┬─────────────────┬────────────────────────────────┬─────────┐
│     │                 │                                │         │
│  S  │     CANAIS      │         CHAT AREA             │ MEMBROS │
│  E  │                 │                               │         │
│  R  │  📁 GERAL       │  ┌──────────────────────────┐ │  🤖     │
│  V  │  • #general     │  │                          │ │ Alex    │
│  I  │  • #dev         │  │     MESSAGE LIST         │ │ Sarah   │
│  D  │  • #design      │  │                          │ │ Bot     │
│  O  │                 │  │                          │ │         │
│  R  │  📋 ISSUES      │  └──────────────────────────┘ │  👤     │
│  E  │  • Kanban       │                               │ User    │
│  S  │                 │  ┌──────────────────────────┐ │         │
│     │  💬 FORUM       │  │      CHAT INPUT          │ │         │
│     │  • Discuss      │  └──────────────────────────┘ │         │
│     │                 │                               │         │
└─────┴─────────────────┴────────────────────────────────┴─────────┘
```

### Cores e Tema Discord

```css
/* CSS Variables seguindo o tema Discord */
:root {
  /* Discord Dark Theme */
  --discord-bg-primary: #36393f; /* Background principal */
  --discord-bg-secondary: #2f3136; /* Background secundário */
  --discord-bg-tertiary: #202225; /* Background sidebar */
  --discord-text-primary: #dcddde; /* Texto principal */
  --discord-text-secondary: #8e9297; /* Texto secundário */
  --discord-text-muted: #72767d; /* Texto esmaecido */
  --discord-accent: #5865f2; /* Cor de destaque */
  --discord-accent-hover: #4752c4; /* Hover destaque */
  --discord-success: #3ba55d; /* Verde sucesso */
  --discord-warning: #faa81a; /* Amarelo warning */
  --discord-danger: #ed4245; /* Vermelho erro */
  --discord-online: #3ba55d; /* Status online */
  --discord-away: #faa81a; /* Status away */
  --discord-busy: #ed4245; /* Status busy */
  --discord-offline: #747f8d; /* Status offline */
}
```

## 🏠 Layout Principal

### Discord Layout Component

```typescript
// src/renderer/components/layout/discord-layout.tsx
import { useState } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { useProjects } from '../../hooks/use-projects';
import { ServerSidebar } from './server-sidebar';
import { ChannelSidebar } from './channel-sidebar';
import { ChatArea } from './chat-area';
import { MemberSidebar } from './member-sidebar';
import { TopBar } from './topbar';

export function DiscordLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { selectedProject } = useProjects();
  const [showMemberSidebar, setShowMemberSidebar] = useState(true);

  return (
    <div className="flex h-screen bg-discord-bg-primary text-discord-text-primary">
      {/* Sidebar de Servidores/Projetos */}
      <ServerSidebar className="w-16 bg-discord-bg-tertiary" />

      {/* Sidebar de Canais do Projeto Atual */}
      {selectedProject && (
        <ChannelSidebar
          project={selectedProject}
          className="w-60 bg-discord-bg-secondary"
        />
      )}

      {/* Área Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          project={selectedProject}
          onToggleMemberSidebar={() => setShowMemberSidebar(!showMemberSidebar)}
        />

        <div className="flex-1 flex min-h-0">
          {/* Conteúdo Principal */}
          <div className="flex-1 flex flex-col min-w-0">
            {children}
          </div>

          {/* Sidebar de Membros/Agentes */}
          {showMemberSidebar && selectedProject && (
            <MemberSidebar
              project={selectedProject}
              className="w-60 bg-discord-bg-secondary border-l border-discord-bg-tertiary"
            />
          )}
        </div>
      </div>
    </div>
  );
}
```

### Server Sidebar Component

```typescript
// src/renderer/components/layout/server-sidebar.tsx
import { useProjects } from '../../hooks/use-projects';
import { useNavigation } from '../../hooks/use-navigation';
import { ProjectIcon } from '../project/project-icon';
import { Button } from '../ui/button';
import { Plus, Home, Settings } from 'lucide-react';

interface ServerSidebarProps {
  className?: string;
}

export function ServerSidebar({ className }: ServerSidebarProps) {
  const { projects, selectedProject, selectProject } = useProjects();
  const { navigateToHome, navigateToSettings } = useNavigation();

  return (
    <div className={`flex flex-col items-center py-3 space-y-2 ${className}`}>
      {/* Botão Home */}
      <Button
        variant="ghost"
        size="icon"
        className="w-12 h-12 rounded-3xl bg-discord-accent hover:bg-discord-accent-hover hover:rounded-2xl transition-all duration-200"
        onClick={navigateToHome}
      >
        <Home className="w-6 h-6 text-white" />
      </Button>

      {/* Separator */}
      <div className="w-8 h-0.5 bg-discord-bg-primary rounded-full" />

      {/* Lista de Projetos */}
      <div className="flex flex-col space-y-2">
        {projects.map((project) => (
          <ProjectIcon
            key={project.id}
            project={project}
            isSelected={selectedProject?.id === project.id}
            onClick={() => selectProject(project)}
          />
        ))}
      </div>

      {/* Botão Adicionar Projeto */}
      <Button
        variant="ghost"
        size="icon"
        className="w-12 h-12 rounded-3xl bg-discord-bg-primary hover:bg-discord-success hover:rounded-2xl transition-all duration-200"
        onClick={() => {/* Abrir modal criar projeto */}}
      >
        <Plus className="w-6 h-6 text-discord-success" />
      </Button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Configurações */}
      <Button
        variant="ghost"
        size="icon"
        className="w-12 h-12 rounded-3xl bg-discord-bg-primary hover:bg-discord-bg-secondary hover:rounded-2xl transition-all duration-200"
        onClick={navigateToSettings}
      >
        <Settings className="w-6 h-6 text-discord-text-secondary" />
      </Button>
    </div>
  );
}
```

### Channel Sidebar Component

```typescript
// src/renderer/components/layout/channel-sidebar.tsx
import { useChannels } from '../../hooks/use-channels';
import { useAgents } from '../../hooks/use-agents';
import { ChannelList } from '../project/channel-list';
import { Button } from '../ui/button';
import { Hash, MessageSquare, Kanban, Settings, ChevronDown } from 'lucide-react';
import type { Project } from '../../shared/types/project';

interface ChannelSidebarProps {
  project: Project;
  className?: string;
}

export function ChannelSidebar({ project, className }: ChannelSidebarProps) {
  const { channels } = useChannels(project.id);
  const { agents } = useAgents(project.id);

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Header do Projeto */}
      <div className="p-4 border-b border-discord-bg-tertiary">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-discord-text-primary truncate">
            {project.name}
          </h1>
          <ChevronDown className="w-4 h-4 text-discord-text-secondary" />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto">
        {/* Seção Canais de Texto */}
        <div className="p-2">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center space-x-1">
              <ChevronDown className="w-3 h-3 text-discord-text-muted" />
              <span className="text-xs font-medium text-discord-text-muted uppercase tracking-wide">
                Text Channels
              </span>
            </div>
            <Button variant="ghost" size="icon" className="w-4 h-4">
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          <ChannelList channels={channels} />
        </div>

        {/* Seção Issues */}
        <div className="p-2">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center space-x-1">
              <ChevronDown className="w-3 h-3 text-discord-text-muted" />
              <span className="text-xs font-medium text-discord-text-muted uppercase tracking-wide">
                Issues
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start px-2 py-1 h-8 text-discord-text-secondary hover:bg-discord-bg-primary hover:text-discord-text-primary"
            >
              <Kanban className="w-4 h-4 mr-2" />
              Kanban Board
            </Button>
          </div>
        </div>

        {/* Seção Fórum */}
        <div className="p-2">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center space-x-1">
              <ChevronDown className="w-3 h-3 text-discord-text-muted" />
              <span className="text-xs font-medium text-discord-text-muted uppercase tracking-wide">
                Forum
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start px-2 py-1 h-8 text-discord-text-secondary hover:bg-discord-bg-primary hover:text-discord-text-primary"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Discussions
            </Button>
          </div>
        </div>
      </div>

      {/* Footer com configurações do projeto */}
      <div className="p-2 border-t border-discord-bg-tertiary">
        <Button
          variant="ghost"
          className="w-full justify-start px-2 py-1 h-8 text-discord-text-secondary hover:bg-discord-bg-primary hover:text-discord-text-primary"
        >
          <Settings className="w-4 h-4 mr-2" />
          Project Settings
        </Button>
      </div>
    </div>
  );
}
```

---

## 💬 Componentes de Chat

### Chat Area Component

```typescript
// src/renderer/components/chat/chat-area.tsx
import { useParams } from '@tanstack/react-router';
import { useMessages } from '../../hooks/use-messages';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { TypingIndicator } from './typing-indicator';

export function ChatArea() {
  const { channelId } = useParams({ from: '/project/$projectId/chat/$channelId' });
  const { messages, sendMessage, isLoading } = useMessages(channelId);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-discord-text-muted">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Lista de Mensagens */}
      <MessageList messages={messages} className="flex-1" />

      {/* Indicador de Digitação */}
      <TypingIndicator channelId={channelId} />

      {/* Input de Mensagem */}
      <ChatInput
        onSend={sendMessage}
        placeholder={`Message #${channel?.name || 'channel'}`}
      />
    </div>
  );
}
```

### Message Item Component

```typescript
// src/renderer/components/chat/message-item.tsx
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { AgentAvatar } from '../agent/agent-avatar';
import { Button } from '../ui/button';
import { MoreHorizontal, Reply, Edit, Trash } from 'lucide-react';
import type { Message } from '../../shared/types/message';

interface MessageItemProps {
  message: Message;
  showAvatar?: boolean;
  onReply?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
}

export function MessageItem({
  message,
  showAvatar = true,
  onReply,
  onEdit,
  onDelete
}: MessageItemProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className="group px-4 py-2 hover:bg-discord-bg-tertiary/30 relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        {showAvatar && (
          <div className="w-10 h-10 rounded-full overflow-hidden">
            {message.authorType === 'agent' ? (
              <AgentAvatar agentId={message.authorId} size="sm" />
            ) : (
              <div className="w-full h-full bg-discord-accent flex items-center justify-center text-white font-medium">
                U
              </div>
            )}
          </div>
        )}

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          {showAvatar && (
            <div className="flex items-baseline space-x-2 mb-1">
              <span className="font-medium text-discord-text-primary">
                {message.authorType === 'agent' ? 'Agent Name' : 'User Name'}
              </span>
              {message.authorType === 'agent' && (
                <span className="text-xs bg-discord-accent px-1 rounded text-white">
                  BOT
                </span>
              )}
              <span className="text-xs text-discord-text-muted">
                {formatDistanceToNow(message.createdAt, { addSuffix: true })}
              </span>
            </div>
          )}

          {/* Mensagem */}
          <div className="text-discord-text-primary">
            {message.content}
          </div>

          {/* Metadata (se houver) */}
          {message.messageType !== 'text' && (
            <div className="text-xs text-discord-text-muted mt-1">
              {message.messageType === 'system' && '🔔 System message'}
              {message.messageType === 'task_result' && '✅ Task completed'}
            </div>
          )}
        </div>
      </div>

      {/* Actions Menu */}
      {showActions && (
        <div className="absolute top-2 right-4 bg-discord-bg-secondary border border-discord-bg-tertiary rounded-md shadow-lg flex">
          {onReply && (
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => onReply(message)}>
              <Reply className="w-4 h-4" />
            </Button>
          )}
          {onEdit && message.authorType === 'user' && (
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => onEdit(message)}>
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => onDelete(message)}>
              <Trash className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
```

### Chat Input Component

```typescript
// src/renderer/components/chat/chat-input.tsx
import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Send, Plus, Smile } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({ onSend, placeholder, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4">
      <div className="bg-discord-bg-tertiary rounded-lg">
        <div className="flex items-end p-3">
          {/* Botão Anexos */}
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-discord-text-muted hover:text-discord-text-primary"
          >
            <Plus className="w-5 h-5" />
          </Button>

          {/* Input de Texto */}
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || 'Type a message...'}
            disabled={disabled}
            className="flex-1 mx-2 min-h-[24px] max-h-32 resize-none bg-transparent border-none text-discord-text-primary placeholder-discord-text-muted focus:ring-0"
            rows={1}
          />

          {/* Botão Emoji */}
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-discord-text-muted hover:text-discord-text-primary"
          >
            <Smile className="w-5 h-5" />
          </Button>

          {/* Botão Enviar */}
          <Button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            size="icon"
            className="w-8 h-8 ml-2 bg-discord-accent hover:bg-discord-accent-hover disabled:bg-discord-bg-primary"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## 🤖 Componentes de Agentes

### Agent Avatar Component

```typescript
// src/renderer/components/agent/agent-avatar.tsx
import { useAgent } from '../../hooks/use-agents';
import { AgentStatus } from './agent-status';

interface AgentAvatarProps {
  agentId: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  className?: string;
}

export function AgentAvatar({
  agentId,
  size = 'md',
  showStatus = true,
  className
}: AgentAvatarProps) {
  const { agent } = useAgent(agentId);

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  if (!agent) {
    return (
      <div className={`${sizeClasses[size]} bg-discord-bg-tertiary rounded-full animate-pulse ${className}`} />
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden`}>
        {agent.avatarUrl ? (
          <img
            src={agent.avatarUrl}
            alt={agent.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-discord-accent flex items-center justify-center text-white font-medium">
            {agent.name[0].toUpperCase()}
          </div>
        )}
      </div>

      {showStatus && (
        <AgentStatus
          status={agent.status}
          className="absolute -bottom-0.5 -right-0.5"
          size={size === 'lg' ? 'md' : 'sm'}
        />
      )}
    </div>
  );
}
```

### Agent Status Component

```typescript
// src/renderer/components/agent/agent-status.tsx
import type { AgentStatus as AgentStatusType } from '../../shared/types/agent';

interface AgentStatusProps {
  status: AgentStatusType;
  size?: 'sm' | 'md';
  className?: string;
}

export function AgentStatus({ status, size = 'md', className }: AgentStatusProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
  };

  const statusColors = {
    online: 'bg-discord-online',
    busy: 'bg-discord-busy',
    offline: 'bg-discord-offline',
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${statusColors[status]}
        rounded-full
        border-2
        border-discord-bg-secondary
        ${className}
      `}
    />
  );
}
```

---

## 📋 Componentes de Projeto

### Project Icon Component

```typescript
// src/renderer/components/project/project-icon.tsx
import { useState } from 'react';
import type { Project } from '../../shared/types/project';

interface ProjectIconProps {
  project: Project;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ProjectIcon({ project, isSelected, onClick }: ProjectIconProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative">
      <button
        className={`
          w-12 h-12 rounded-3xl flex items-center justify-center
          transition-all duration-200 ease-out
          ${isSelected
            ? 'bg-discord-accent rounded-2xl'
            : isHovered
              ? 'bg-discord-accent rounded-2xl'
              : 'bg-discord-bg-primary hover:bg-discord-accent'
          }
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        {project.iconUrl ? (
          <img
            src={project.iconUrl}
            alt={project.name}
            className="w-8 h-8 rounded-xl"
          />
        ) : project.iconEmoji ? (
          <span className="text-xl">{project.iconEmoji}</span>
        ) : (
          <span className="text-white font-semibold">
            {project.name.substring(0, 2).toUpperCase()}
          </span>
        )}
      </button>

      {/* Indicator de seleção */}
      <div
        className={`
          absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2
          w-2 bg-white rounded-r-full transition-all duration-200
          ${isSelected ? 'h-10' : isHovered ? 'h-5' : 'h-0'}
        `}
      />

      {/* Tooltip */}
      {isHovered && !isSelected && (
        <div className="absolute left-16 top-1/2 transform -translate-y-1/2 z-50">
          <div className="bg-black text-white px-2 py-1 rounded text-sm whitespace-nowrap">
            {project.name}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🎯 Benefícios da Interface Discord-like

### ✅ Familiaridade

- **UX conhecida** - Desenvolvedores já sabem usar
- **Curva de aprendizado zero** - Interface intuitiva
- **Muscle memory** - Gestos e atalhos familiares

### ✅ Produtividade

- **Navegação rápida** - Sidebar e atalhos eficientes
- **Chat fluido** - Comunicação sem fricção
- **Multi-contexto** - Múltiplos projetos/canais

### ✅ Escalabilidade

- **Component-based** - Componentes reutilizáveis
- **Type-safe** - TypeScript end-to-end
- **Performance** - Otimizado para listas grandes

### ✅ Customização

- **Temas** - Dark/Light mode
- **Adaptável** - Funcionalidades específicas dev
- **Extensível** - Fácil adicionar features

---

## 📈 Próximos Documentos

1. **ROUTING-SYSTEM.md** - Sistema de roteamento TanStack Router
2. **AGENT-WORKERS.md** - Sistema de agentes background
3. **CODING-STANDARDS.md** - Padrões e convenções de código

---

_Esta interface Discord-like foi projetada para maximizar familiaridade e produtividade, oferecendo uma experiência intuitiva para desenvolvedores._
