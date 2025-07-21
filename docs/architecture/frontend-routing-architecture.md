# Frontend Routing Architecture - Project Wiz

## Visão Geral

Este documento descreve a arquitetura de roteamento e layouts para o Project Wiz, uma fábrica de software com agentes autônomos. A interface é visualmente inspirada no Discord, mas focada em desenvolvimento colaborativo com IA.

## Conceitos Fundamentais

### 3 Contextos Distintos

1. **PÚBLICO** - Área não autenticada (login/cadastro)
2. **USUÁRIO** - Área pessoal para conversas com agentes
3. **PROJETO** - Área de projeto específico para desenvolvimento colaborativo

### Componentes de Layout

- **Titlebar**: Controles da janela (minimize, maximize, close)
- **RootSidebar**: Lista de projetos + acesso à área pessoal
- **UserSidebar**: Navegação do contexto usuário
- **ProjectSidebar**: Navegação do contexto projeto
- **ContentHeader**: Cabeçalho da área de conteúdo (por página)

## Estrutura de Rotas TanStack Router

```
app/
├── __root.tsx                    # Window: Titlebar + Outlet
├── _authenticated/               # Pathless: Auth guard
│   ├── _layout.tsx              # Layout: RootSidebar + Outlet
│   ├── user/                    # Contexto usuário
│   │   ├── _layout.tsx          # Layout: UserSidebar + Outlet
│   │   ├── index.tsx            # /user
│   │   └── dm/
│   │       └── $agentId.tsx     # /user/dm/123
│   └── project/                 # Contexto projeto
│       └── $projectId/
│           ├── _layout.tsx      # Layout: ProjectSidebar + Outlet
│           ├── index.tsx        # /project/123
│           └── channel/
│               └── $channelId.tsx # /project/123/channel/456
└── auth/                        # Contexto público
    ├── _layout.tsx              # Layout público
    ├── login.tsx                # /auth/login
    └── register.tsx             # /auth/register
```

## Responsabilidades dos Layouts

### `__root.tsx` - Window Layout

```tsx
function RootComponent() {
  return (
    <div className="h-screen flex flex-col">
      <Titlebar /> {/* Window controls */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
```

**Responsabilidade**: Controles da janela desktop sempre presentes

### `_authenticated/_layout.tsx` - Authenticated Layout

```tsx
function AuthenticatedLayout() {
  return (
    <div className="h-full flex">
      <RootSidebar /> {/* Compartilhado entre contextos */}
      <div className="flex-1 flex">
        <Outlet /> {/* user/_layout ou project/$projectId/_layout */}
      </div>
    </div>
  );
}
```

**Responsabilidade**:

- Auth guard centralizado
- RootSidebar sempre presente quando autenticado
- Redirecionamento para `/auth/login` se não autenticado

### `_authenticated/user/_layout.tsx` - User Context Layout

```tsx
function UserLayout() {
  return (
    <>
      <UserSidebar />
      <main className="flex-1">
        <Outlet /> {/* user/index.tsx, user/dm/$agentId.tsx */}
      </main>
    </>
  );
}
```

**Responsabilidade**: UserSidebar + área de conteúdo do usuário

### `_authenticated/project/$projectId/_layout.tsx` - Project Context Layout

```tsx
function ProjectLayout() {
  const { projectId } = Route.useParams();

  return (
    <>
      <ProjectSidebar projectId={projectId} />
      <main className="flex-1">
        <Outlet /> {/* project/index.tsx, project/channel/$channelId.tsx */}
      </main>
    </>
  );
}
```

**Responsabilidade**: ProjectSidebar específica + área de conteúdo do projeto

### `auth/_layout.tsx` - Public Layout

```tsx
function AuthLayout() {
  return (
    <div className="h-full bg-muted flex items-center justify-center">
      <Outlet /> {/* auth/login.tsx, auth/register.tsx */}
    </div>
  );
}
```

**Responsabilidade**: Layout público centrado para login/cadastro

## Composição Visual

### Contexto Usuário (`/user` ou `/user/dm/123`)

```
┌─────────────────────────────────────┐
│ Titlebar (window controls)          │  ← __root.tsx
├─┬────────┬─────────────────────────┤
│Root     │User     │ Content        │  ← _authenticated/_layout.tsx
│Sidebar  │Sidebar  │ Area           │  ← user/_layout.tsx
│         │         │ + Header       │  ← user/index.tsx
│         │         │                │
└─┴────────┴─────────────────────────┘
```

### Contexto Projeto (`/project/123` ou `/project/123/channel/456`)

```
┌─────────────────────────────────────┐
│ Titlebar (window controls)          │  ← __root.tsx
├─┬────────┬─────────────────────────┤
│Root     │Project  │ Content        │  ← _authenticated/_layout.tsx
│Sidebar  │Sidebar  │ Area           │  ← project/$projectId/_layout.tsx
│         │         │ + Header       │  ← project/index.tsx
│         │         │                │
└─┴────────┴─────────────────────────┘
```

### Contexto Público (`/auth/login` ou `/auth/register`)

```
┌─────────────────────────────────────┐
│ Titlebar (window controls)          │  ← __root.tsx
├─────────────────────────────────────┤
│                                     │  ← auth/_layout.tsx
│          Login/Register             │  ← auth/login.tsx
│             Form                    │
│                                     │
└─────────────────────────────────────┘
```

## Componentes da Interface

### RootSidebar (ex-ServerSidebar)

- **Localização**: Primeira coluna visual
- **Conteúdo**: Lista de projetos + botão "Área Pessoal"
- **Navegação**:
  - Botão User → `/user`
  - Projeto X → `/project/X`
- **Visual**: Coluna estreita (56px) com ícones redondos

### UserSidebar (ex-Sidebar principal)

- **Localização**: Segunda coluna visual no contexto usuário
- **Conteúdo**: Conversas com agentes pessoais, histórico
- **Navegação**: Links para DMs com agentes
- **Visual**: Coluna média (240px) com lista textual

### ProjectSidebar (novo componente)

- **Localização**: Segunda coluna visual no contexto projeto
- **Conteúdo**: Canais do projeto, agentes do projeto, membros
- **Props**: Recebe `projectId` do layout
- **Visual**: Coluna média (240px) com estrutura hierárquica

### ContentHeader

- **Localização**: Topo da área de conteúdo
- **Responsabilidade**: Cada página define seu próprio header
- **Conteúdo**: Título, breadcrumb, ações contextuais

## Auth Guard Centralizado

```tsx
// _authenticated/_layout.tsx
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: "/auth/login" });
    }
  },
  component: AuthenticatedLayout,
});
```

## Fluxo de Navegação

1. **Acesso inicial**: `/` → redireciona para `/auth/login` ou `/user`
2. **Login**: `/auth/login` → autentica → redireciona para `/user`
3. **Área pessoal**: `/user` → conversas com agentes pessoais
4. **Acesso projeto**: Clica projeto na RootSidebar → `/project/123`
5. **Canal projeto**: Clica canal → `/project/123/channel/456`
6. **Volta área pessoal**: Clica ícone user na RootSidebar → `/user`

## Vantagens da Arquitetura

### ✅ DRY (Don't Repeat Yourself)

- RootSidebar definida uma vez, reutilizada automaticamente
- Layouts compostos hierarquicamente
- Auth guard centralizado

### ✅ Performance

- TanStack Router otimiza re-renders
- Layouts aninhados = carregamento incremental
- Componentes preservados entre navegações

### ✅ Manutenibilidade

- Estrutura clara e previsível
- Responsabilidades bem definidas
- Fácil adicionar novos contextos

### ✅ UX Familiar

- Interface Discord-like conhecida pelos desenvolvedores
- Transições suaves entre contextos
- Navegação intuitiva

## Refatoração Necessária

### Componentes a Renomear

- `ServerSidebar` → `RootSidebar`
- `Sidebar` atual → `UserSidebar`

### Componentes a Criar

- `ProjectSidebar` para contexto de projeto
- Layouts `_layout.tsx` para cada nível

### Arquivos a Mover/Reorganizar

- `/dashboard.tsx` → `/_authenticated/user/index.tsx`
- `/dashboard/server/$serverId.tsx` → `/_authenticated/project/$projectId/index.tsx`
- Remover `DashboardLayout` - substituído pelos layouts pathless

### Rotas de Redirecionamento

- `/` → `/auth/login` (não autenticado) ou `/user` (autenticado)
- `/dashboard` → `/user` (compatibilidade temporária)
- `/dashboard/server/$serverId` → `/project/$serverId`

## Considerações Técnicas

- **Pathless Routes**: Uso de `_layout.tsx` para layouts que não afetam URL
- **Route Groups**: Uso de `_authenticated/` para agrupar rotas autenticadas
- **Nested Layouts**: Composição hierárquica automática pelo TanStack Router
- **Type Safety**: Params tipados automaticamente (`$projectId`, `$channelId`)
- **Performance**: Lazy loading automático por rota, preservação de estado

## Próximos Passos

1. Implementar estrutura de rotas pathless
2. Refatorar componentes existentes
3. Criar ProjectSidebar
4. Implementar auth guards
5. Configurar redirecionamentos de compatibilidade
6. Testar fluxos de navegação
