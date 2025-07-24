# Discord UI Implementation Plan

Este documento contém o plano completo para implementar uma interface similar ao Discord no Project Wiz, baseado na análise de screenshots do Discord e adaptado para uso com shadcn/ui.

## 📋 **ANÁLISE DAS IMAGENS DISCORD**

### **Discord Server View (Imagem 1)**

- **Left Sidebar**: Lista de servidores com ícones circulares/quadrados + botão adicionar
- **Middle Sidebar**: Nome do servidor, canais de texto/voz categorizados, status do usuário no bottom
- **Main Chat Area**: Mensagens com avatar, nome, timestamp, conteúdo formatado
- **Right Sidebar**: Lista de membros online/offline com status colorido
- **Chat Input**: Campo de texto no bottom com botões de ação

### **Discord DM Individual (Imagem 2)**

- **Left Sidebar**: "Mensagens diretas", lista de conversas ativas com avatares
- **Main Chat Area**: Conversa direta com suporte a mídia (imagens) + input no bottom
- **Top Bar**: Nome do usuário, ícones de ação (call, video, pin, etc.)
- **No Right Sidebar**: Layout 2-column para conversas individuais

### **Discord DM Grupo (Imagem 3)**

- **Similar ao DM Individual** mas com múltiplos participantes
- **Right Sidebar**: Lista de membros do grupo com status
- **Badge "NOVO"**: Indicador de mensagens não lidas
- **Group Info**: Contador de membros no top bar

### **Discord Settings (Imagem 4)**

- **Left Sidebar**: Categorias de configuração organizadas hierarquicamente
- **Main Content**: Formulário de perfil com tabs (Segurança, Status)
- **Profile Section**: Avatar grande, informações editáveis
- **Right Top**: Botão close (X) + ESC hint
- **Form Fields**: Campos editáveis com botões "Edit" à direita

## 🎯 **MAPEAMENTO DISCORD → PROJECT WIZ**

### **Correspondências Diretas**

| Discord Element | Project Wiz Element | Função                   |
| --------------- | ------------------- | ------------------------ |
| Servers         | Projects            | Workspace principal      |
| Channels        | Project Channels    | Conversas organizadas    |
| DMs             | Conversations       | Chat com Agents/Usuários |
| Server Members  | Project Members     | Colaboradores            |
| User Status     | User/Agent Status   | Disponibilidade          |
| Settings Modal  | Settings Pages      | Configurações            |
| Message Input   | Message Input       | Interface de chat        |

## 📐 **LAYOUTS ASCII**

### **1. PROJECT VIEW (3-Column) - ✅ IMPLEMENTADO**

```
┌─────┬──────────────────┬─────────────────────────────────────────┬──────────────┐
│ [P1]│ PROJECT: AI-PROJ │     ContentHeader - Dashboard [👥]     │   MEMBERS    │
│ [P2]├──────────────────┼─────────────────────────────────────────┤              │
│ [P3]│ # Dashboard      │ Main Content Area                       │ Online — 2   │
│ [+] │ ─────────────────│                                         │ 🟢 Nicolas   │
├─────┤ 📁 TEXT CHANNELS │ Project overview, stats, etc.          │ 🤖 Claude    │
│ ⚪ │   # general      │                                         │              │
├─────┤   # dev-chat     │                                         │ Away — 1     │
│ ... │                  │                                         │ 🟡 John      │
├─────┤                  │                                         │              │
│     │                  │                                         │ Offline — 1  │
│     │                  │                                         │ 🤖 GPT-4     │
│     │ ─────────────────│                                         │              │
│ [⚙] │ 🟢 nicolas       │                                         │              │
│ [+] │ ⚡ Available     │                                         │              │
└─────┴──────────────────┴─────────────────────────────────────────┴──────────────┘

✅ LAYOUT REAL IMPLEMENTADO:
- ContentHeader com toggle [👥] (ocupa toda largura)
- MemberSidebar toggleável sem header próprio
- Dashboard como primeiro item de navegação
- Agentes integrados na lista de membros
```

### **2. USER AREA VIEW (2-Column) - ✅ JÁ FUNCIONAL**

```
┌─────┬──────────────────┬─────────────────────────────────────┐
│ [P1]│  DIRECT MESSAGES │          💬 @claude-agent          │
│ [P2]├──────────────────┼─────────────────────────────────────┤
│ [P3]│ 🔍 Find/Start    │ 🤖 Claude 14:20                   │
│ [+] │                  │ I can help you with your coding    │
├─────┤ 💬 CONVERSATIONS │ tasks. What would you like to      │
│ ⚪ │                  │ work on today?                      │
├─────┤ [🤖] claude-ai   │                                     │
│ ... │ [🚀] copilot     │ 👤 You 14:21                      │
├─────┤ [⚡] cursor      │ I need help with React components  │
│     │ [👤] john        │                                     │
│     │                  │ 🤖 Claude 14:22                   │
│     │ ─────────────────│ I'd be happy to help! What         │
│ [⚙] │ 🟢 john          │ specific React component are you   │
│ [+] │ ⚡ Available     │ working on?                         │
└─────┴──────────────────┴─────────────────────────────────────┘

✅ JÁ IMPLEMENTADO E FUNCIONAL:
- UserSidebar com lista de conversations
- Chat interface básica funcionando
- Navegação entre conversations
- Sem necessidade de modificações por ora
```

### **3. SETTINGS VIEW - Overlay/Sheet sobre interface atual**

```
OPÇÃO A: Modal/Dialog Full Screen
┌─────────────────────────────────────────────────────────────────────────────┐
│                             Settings                                    [×] │
├──────────────────────┬─────────────────────────────────────────────────────┤
│ 🔧 USER CONFIG       │ ┌─────────┬────────┐                              │
│   My Account         │ │Security │ Status │                              │
│   Profile            │ └─────────┴────────┘                              │
│   Privacy & Safety   │                                                     │
│                      │ ┌─────────────────────────────────────────────┐   │
│ 🎨 APP CONFIG        │ │          [👤 Profile Image]                │   │
│   Appearance         │ │         John Developer                      │   │
│   Language           │ │         🎯 Available                       │   │
│   Advanced           │ └─────────────────────────────────────────────┘   │
│                      │                                                     │
│ 🤖 AI CONFIG         │ Display Name                         [Edit]     │
│   Agents             │ John Developer                                      │
│   LLM Providers      │                                                     │
│                      │ Username                            [Edit]     │
│ ──────────────────── │ johndeveloper                                       │
│ 🟢 John Developer    │                                                     │
│ ⚡ Available         │ Email                               [Edit]     │
│                      │ ********@email.com    [Show]                       │
└──────────────────────┴─────────────────────────────────────────────────────┘

OPÇÃO B: Settings ocupa área central (substitui sidebar secundária + conteúdo)
┌─────┬──────────────────┬─────────────────────────────────────────────────────┐
│ [P1]│   USER SETTINGS  │                   My Account                    [×] │
│ [P2]├──────────────────┼─────────────────────────────────────────────────────┤
│ [P3]│ 🔧 USER CONFIG   │ ┌─────────┬────────┐                              │
│ [+] │   My Account     │ │Security │ Status │                              │
├─────┤   Profile        │ └─────────┴────────┘                              │
│ ⚪ │   Privacy        │                                                     │
├─────┤                  │ ┌─────────────────────────────────────────────┐   │
│ ... │ 🎨 APP CONFIG    │ │          [👤 Profile Image]                │   │
├─────┤   Appearance     │ │         John Developer                      │   │
│     │   Language       │ │         🎯 Available                       │   │
│     │                  │ └─────────────────────────────────────────────┘   │
│     │ 🤖 AI CONFIG     │                                                     │
│     │   Agents         │ Display Name                         [Edit]     │
│     │   LLM Providers  │ John Developer                                      │
│     │ ──────────────── │                                                     │
│ [⚙] │ 🟢 John Dev      │ Username                            [Edit]     │
│ [+] │ ⚡ Available     │ johndeveloper                                       │
└─────┴──────────────────┴─────────────────────────────────────────────────────┘
```

## 🧩 **COMPONENTES SHADCN/UI NECESSÁRIOS**

### **Layout Components**

- [ ] `ResizablePane` - Sidebars redimensionáveis
- [ ] `ScrollArea` - Listas longas com scroll
- [ ] `Separator` - Divisores entre seções
- [ ] `Sheet` - Modal lateral para settings
- [ ] `Dialog` - Modais para ações

### **Navigation Components**

- [ ] `Avatar` - Usuários, projetos, agentes
- [ ] `Badge` - Status, notificações, contadores
- [ ] `Button` - Navegação (variant="ghost")
- [ ] `DropdownMenu` - Ações contextuais
- [ ] `Tooltip` - Informações hover

### **Chat Components**

- [ ] `Card` - Container de mensagens
- [ ] `Input` - Message composer simples
- [ ] `Textarea` - Message composer expansível
- [ ] `Button` - Send button

### **Settings Components**

- [ ] `Tabs` - Seções de configuração
- [ ] `Form` - FormField, FormItem, FormControl
- [ ] `Switch` - Toggles booleanos
- [ ] `Select` - Dropdowns de opções
- [ ] `Label` - Rótulos de campos

### **Status & Indicators**

- [ ] `Badge` - Status badges (online/offline)
- [ ] `Progress` - Loading states
- [ ] `Skeleton` - Loading placeholders
- [ ] `Alert` - Mensagens de sistema
- [ ] `Toast` - Notificações temporárias

## 📁 **ESTRUTURA DE COMPONENTES**

### **Componentes Implementados & Estrutura Atual**

**✅ IMPLEMENTADO:**

```
src/renderer/components/members/     # ✅ CRIADO
├── member-sidebar.tsx               # ✅ Sidebar de membros sem header

src/renderer/features/app/components/ # ✅ ATUALIZADOS
├── root-sidebar.tsx                 # ✅ JÁ CORRETO - user no topo, projetos, botões
├── project-sidebar.tsx              # ✅ ATUALIZADO - Dashboard + TEXT CHANNELS
├── content-header.tsx               # ✅ ATUALIZADO - toggle members button
└── user-sidebar.tsx                 # ✅ JÁ FUNCIONAL - conversations DM
```

**📋 AINDA NECESSÁRIO:**

```
src/renderer/components/chat/        # Para próximas phases
├── message-list.tsx                 # Lista de mensagens
├── message-bubble.tsx               # Bolha de mensagem individual
└── message-composer.tsx             # Input melhorado

src/renderer/features/conversation/components/  # Para User area
├── conversation-list.tsx            # Lista de conversas DM
├── conversation-item.tsx            # Item de conversa individual
└── conversation-header.tsx          # Header da conversa
```

## 🔍 **DESCOBERTAS DURANTE A IMPLEMENTAÇÃO**

### **✅ Pontos Positivos Encontrados:**

- **RootSidebar já estava perfeito** - user no topo, projetos, botões no bottom
- **ProjectSidebar já tinha estrutura** - TEXT CHANNELS, agents, conversations
- **Route system bem estruturado** - fácil adicionar 3-column layout
- **UserSidebar já funcional** - lista de conversations DM funciona

### **🔧 Ajustes Necessários Descobertos:**

- **Layout inline é melhor** - não precisou de componentes abstratos
- **Altura requer cadeia completa** - h-full em todos os containers
- **Toggle deve ficar no header** - não criar espaço separado
- **Members sidebar sem header** - mais limpo, toggle centralizado
- **Dashboard necessário** - item de navegação principal do projeto

### **📋 Estrutura Real vs Planejada:**

| Planejado                    | Real                          | Status               |
| ---------------------------- | ----------------------------- | -------------------- |
| `three-column-layout.tsx`    | Layout inline nas rotas       | ✅ Melhor            |
| `project-member-sidebar.tsx` | `member-sidebar.tsx` genérico | ✅ Reutilizável      |
| Header com close button      | Toggle no ContentHeader       | ✅ Mais Discord-like |
| Members sempre visível       | Toggle show/hide              | ✅ Mais funcional    |

## ✅ **CHECKLIST DE IMPLEMENTAÇÃO**

### **Phase 1: Layout Base** ✅ **COMPLETO**

- [x] ~~Implementar `three-column-layout.tsx`~~ **DESNECESSÁRIO** - Layout inline direto nas rotas
- [x] ~~Implementar `two-column-layout.tsx`~~ **MANTER ATUAL** - User area já funciona bem
- [x] **Modificar route `/project/$projectId/channel/$channelId`** para 3-column
- [x] **Adicionar MemberSidebar** na route `/project/$projectId` (página principal)
- [x] **Corrigir altura das sidebars** - cadeia h-full completa

### **Phase 2: Project View - Canal de Texto Only** ✅ **COMPLETO**

- [x] **Adicionar Dashboard** no topo do ProjectSidebar
- [x] **ProjectSidebar já tem "TEXT CHANNELS"** - seção existente funcional
- [x] ~~Implementar `channel-list.tsx`~~ **JÁ EXISTE** - dentro do ProjectSidebar
- [x] ~~Implementar `channel-item.tsx`~~ **JÁ EXISTE** - Link com ícone # funcional
- [x] **Implementar `MemberSidebar`** em `/renderer/components/members/`
- [x] **MemberSidebar sem header** - removido conforme feedback
- [x] **Toggle Members no ContentHeader** - botão fixo no header

### **Phase 3: Chat Interface - Texto Only**

- [ ] Implementar `message-list.tsx` em `/renderer/components/chat/`
- [ ] Implementar `message-bubble.tsx` com avatar, nome, timestamp
- [ ] Atualizar `message-composer.tsx` em conversation components
- [ ] Integrar chat com dados existentes de conversations
- [ ] Testar envio e recebimento de mensagens texto

### **Phase 4: User Area - Conversations**

- [ ] Atualizar `user-sidebar.tsx` com lista de conversations existentes
- [ ] Implementar `conversation-list.tsx` em `/renderer/features/conversation/components/`
- [ ] Implementar `conversation-item.tsx` com avatar e último message
- [ ] Implementar busca/filtro de conversas
- [ ] Usar interface de chat existente
- [ ] Testar flow completo de conversations

### **Phase 5: Settings Interface**

- [ ] Decidir: Dialog full-screen vs Sheet lateral (baseado no Discord)
- [ ] Implementar settings como Dialog full-screen sobrepondo toda interface
- [ ] Usar páginas de settings existentes (agents, llm-providers, appearance)
- [ ] Implementar sidebar de categorias dentro do Dialog
- [ ] Integrar com todas as settings pages existentes
- [ ] Manter botão [⚙] no root-sidebar funcional

### **Phase 6: Status & Visual Polish**

- [ ] Implementar `status-indicator.tsx` para usuários (🟢🟡⚫)
- [ ] Adicionar status indicators nos member-lists
- [ ] Implementar contadores de membros nos project headers
- [ ] Implementar badges de notificação (badge numbers)
- [ ] Ajustar visual geral para ficar similar ao Discord
- [ ] Testar todos os indicadores visuais

### **Phase 7: Integration & Testing**

- [ ] Integrar todos componentes com data loading patterns existentes
- [ ] Integrar com IPC handlers existentes (conversations, projects, users)
- [ ] Implementar loading states com Skeleton
- [ ] Implementar error boundaries
- [ ] Testar performance
- [ ] Code review final

## 🎨 **DESIGN PRINCIPLES**

### **Cores e Tema**

- Manter tema dark do Discord como padrão
- Usar variáveis CSS do shadcn/ui para consistência
- Status colors: 🟢 Online, 🟡 Away, 🔴 Busy, ⚫ Offline
- Badges: Primary para notificações, Secondary para contadores

### **Spacing e Typography**

- Seguir spacing system do Tailwind (4px grid)
- Usar typography scale do shadcn/ui
- Manter densidade similar ao Discord (compacto mas legível)
- Avatares: 32px (small), 40px (medium), 64px (large)

### **Animations**

- Usar framer-motion para transições suaves
- Hover effects sutis nos botões e items
- Smooth scrolling nas listas
- Fade in/out para modals

### **Accessibility**

- ARIA labels em todos os elementos interativos
- Keyboard navigation em todas as listas
- Focus management em modals
- High contrast support

## 🔧 **TECHNICAL CONSIDERATIONS**

### **Performance**

- Virtualization para listas longas (react-window)
- Lazy loading de mensagens antigas
- Debounce em search inputs
- Memo nos componentes que renderizam frequentemente

### **State Management**

- TanStack Router para route state
- TanStack Query para server state
- Local state para UI ephemeral
- Context para theme/user preferences

### **Data Loading**

- Route loaders para initial data
- Infinite queries para message history
- Real-time updates via WebSocket simulation
- Optimistic updates para melhor UX

## 📝 **FUNCIONALIDADES EXISTENTES A REDESENHAR**

### **Funcionalidades do Sistema Atual**

- ✅ **Projects**: Create, list, navigate - mapear para "servers" Discord
- ✅ **Conversations**: DM com agents/users - usar área "User" atual
- ✅ **Messages**: Envio/recebimento texto - melhorar visual Discord-like
- ✅ **Users**: Auth, profile, settings - manter funcionalidade atual
- ✅ **Agents**: Create, configure, chat - integrar em conversations
- ✅ **LLM Providers**: Configure providers - manter em settings
- ✅ **Settings**: Appearance, account - usar Dialog full-screen

### **Limitações de Escopo**

- ❌ **SEM** features novas de funcionalidade
- ❌ **SEM** voice chat, screen sharing, file upload
- ❌ **SEM** reactions, emojis, attachments
- ✅ **APENAS** redesign visual estilo Discord
- ✅ **MANTER** todas funcionalidades atuais intactas

### **Mapeamento Direto**

- **Discord Servers** = **Project Wiz Projects**
- **Discord Channels** = **Project Channels** (a criar)
- **Discord DMs** = **Project Wiz Conversations** (existente)
- **Discord Members** = **Project Members** (a implementar visual)
- **Discord Settings** = **Project Wiz Settings** (redesign UI)

---

## 📈 **STATUS ATUAL**

### **✅ CONCLUÍDO (Phase 1 & 2):**

- **Layout 3-column** funcional para projetos
- **MemberSidebar** implementada e responsiva
- **Toggle sistema** no ContentHeader
- **Dashboard navegação** adicionada
- **Altura corrigida** - cadeia h-full completa
- **Layout Discord-like** básico funcionando

### **🚧 PRÓXIMOS PASSOS:**

- **Phase 3**: Melhorar chat interface (message bubbles, etc.)
- **Phase 4**: Aprimorar User area (conversation styling)
- **Phase 5**: Implementar settings overlay
- **Phase 6**: Polish visual e status indicators

**Created**: 2025-01-24  
**Last Updated**: 2025-01-24  
**Status**: Phase 1 & 2 Complete - Phase 3 Ready  
**Progress**: 30% Complete (2/7 phases)  
**Priority**: High
