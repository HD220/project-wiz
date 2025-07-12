# Project Wiz - Frontend Discord-like

## Visão Geral

Este é o frontend do Project Wiz implementado com uma interface similar ao Discord, construído com React, TypeScript, TailwindCSS e shadcn/ui. A aplicação fornece uma experiência familiar e intuitiva para gerenciamento de projetos assistido por IA.

## Estrutura Implementada

### Componentes Principais

#### Layout Components

- **DiscordLayout**: Layout principal que organiza a interface em sidebars e área de conteúdo
- **AppSidebar**: Sidebar esquerda com lista de projetos (72px de largura)
- **ChannelsSidebar**: Sidebar central com canais e agentes (240px de largura)

#### Features Implementadas

1. **Dashboard Principal** (`/`)
   - Visão geral de projetos ativos
   - Estatísticas de agentes e tarefas
   - Cartões de ações rápidas
   - Status em tempo real

2. **Chat System** (`/chat`)
   - Interface de chat similar ao Discord
   - Suporte a mensagens de texto e código
   - Indicadores de status de agentes
   - Histórico de conversas

3. **Kanban Board** (`/tasks`)
   - Gerenciamento de tarefas estilo Kanban
   - Colunas: A Fazer, Em Progresso, Em Revisão, Concluído
   - Cards de tarefa com prioridade, labels e assignees
   - Progress tracking e datas de vencimento

4. **File Explorer** (`/files`)
   - Explorador de arquivos em árvore
   - Visualizador de conteúdo de arquivos
   - Terminal integrado e redimensionável
   - Context menus com ações de arquivo

5. **Agent Management** (`/agents`)
   - Dashboard de todos os agentes
   - Monitoramento de status e progresso
   - Detalhes e capacidades dos agentes
   - Controles de execução (start/pause)

### Tecnologias Utilizadas

- **React 18** - Interface de usuário
- **TypeScript** - Tipagem estática
- **TailwindCSS** - Estilização utilitária
- **shadcn/ui** - Componentes de UI
- **TanStack Router** - Roteamento
- **Lucide React** - Ícones
- **Placeholder Data** - Dados de exemplo

## Dados Placeholder

Todos os componentes utilizam dados de placeholder definidos em `src/renderer/lib/placeholders.ts`:

- **mockProjects**: Lista de projetos exemplo
- **mockAgents**: Agentes IA com diferentes tipos e status
- **mockTasks**: Tarefas com diferentes estados
- **mockMessages**: Mensagens de chat
- **mockFileTree**: Estrutura de arquivos de exemplo
- **mockTerminalLines**: Histórico do terminal

## Rotas Implementadas

- `/` - Dashboard principal
- `/chat` - Interface de chat
- `/tasks` - Kanban board
- `/files` - Explorador de arquivos + terminal
- `/agents` - Gerenciamento de agentes

## Responsive Design

O layout é totalmente responsivo usando classes TailwindCSS:

```
Mobile (< 768px):     [Projects] overlay + [Main Content]
Tablet (768-1024px):  [Projects] + [Main Content]
Desktop (1024px+):    [Projects] + [Channels] + [Main Content]
Wide (>= 1440px):     [Projects] + [Channels] + [Main Content] + [Right Panel]
```

## Componentes Customizados

### Chat System

- Suporte a diferentes tipos de mensagem (texto, código, sistema)
- Reações em mensagens
- Indicadores de typing
- Formatação markdown básica

### Kanban Board

- Drag & drop ready (estrutura preparada)
- Filtros por status e assignee
- Badges de prioridade coloridos
- Progress tracking visual

### File Explorer

- Navegação em árvore com expand/collapse
- Context menus com ações
- Integração com terminal
- Preview de arquivos

### Terminal Panel

- Múltiplas abas de terminal
- Histórico de comandos (seta para cima/baixo)
- Simulação de execução de comandos
- Status bar com informações

### Agent Dashboard

- Grid responsivo de agents cards
- Filtros por status (online, executing, busy, offline)
- Detalhes expandidos com capacidades
- Controles de ação (chat, start/pause, settings)

## Temas e Cores

Usa variáveis CSS do shadcn/ui com tema Discord-inspired:

```css
--background: 220 13% 18% /* Discord dark background */ --card: 220 13% 23%
  /* Discord card background */ --sidebar: 220 13% 15% /* Discord sidebar */
  --primary: 235 85.6% 64.7% /* Discord blue */;
```

## Como Usar

1. **Navegação**: Use a sidebar esquerda para alternar entre projetos
2. **Canais**: Sidebar central mostra canais de texto e DMs com agentes
3. **Chat**: Clique em canais ou agentes para abrir conversas
4. **Tarefas**: Acesse `/tasks` para ver e gerenciar tarefas no Kanban
5. **Arquivos**: Use `/files` para explorar arquivos e usar o terminal
6. **Agentes**: Gerencie agentes em `/agents` com filtros e controles

## Funcionalidades Destacadas

### Real-time Status

- Indicadores de status de agentes (online, executing, busy, away, offline)
- Progress bars para tarefas em execução
- Badges de notificação em projetos e canais

### Interatividade

- Hover effects em todos os componentes
- Context menus no file explorer
- Resizable panels no layout de arquivos
- Collapsible sections nas sidebars

### Acessibilidade

- Suporte a navegação por teclado
- Tooltips informativos
- Contraste adequado
- Screen reader friendly

## Próximos Passos

Para conectar com o backend:

1. Substituir dados placeholder por chamadas IPC
2. Implementar WebSocket para updates em tempo real
3. Adicionar validação de formulários
4. Implementar drag & drop no Kanban
5. Adicionar uploads de arquivo
6. Conectar terminal com execução real

## Estrutura de Arquivos

```
src/renderer/
├── app/                     # Rotas TanStack Router
├── components/              # Componentes reutilizáveis
│   ├── layout/             # Layout components
│   ├── chat/               # Chat components
│   └── ui/                 # shadcn/ui components
├── features/               # Features modulares
│   ├── task-management/
│   ├── development-tools/
│   ├── agent-management/
│   └── ...
├── lib/                    # Utilities e placeholders
└── hooks/                  # Custom hooks
```

Este frontend fornece uma base sólida e extensível para o Project Wiz, com uma interface moderna e familiar que facilita a adoção pelos usuários.
