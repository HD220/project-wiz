# Component Design Guidelines

Complete reference for all 48 implemented shadcn/ui components plus custom extensions in the Project Wiz design system. This is your production-ready component library with Discord-like interface patterns.

## 🧩 Component Library Overview

### Production Implementation Status

**48 shadcn/ui Components** - All fully implemented, tested, and WCAG 2.1 AA compliant
**5 Custom Extensions** - Built using compound component patterns
**Discord-like Interface** - Server/channel navigation with AI agent interactions
**OKLCH Color System** - Complete dark/light theme support with design tokens

### Implementation Standards

- **Function Declaration Syntax** - No React.FC or arrow functions
- **Destructured Props** - Props destructured in function parameters
- **Named Exports Only** - No default exports for consistency
- **Design Token Usage** - CSS custom properties for all styling
- **Compound Patterns** - Complex components use compound architecture

## 📋 Form Components (12 Components)

### Button Component

**Implementation**: `@/renderer/components/ui/button.tsx`

```tsx
import { Button } from "@/renderer/components/ui/button";

// Variant usage - all implemented
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="destructive">Delete Item</Button>
<Button variant="outline">Outline Style</Button>
<Button variant="ghost">Ghost Style</Button>
<Button variant="link">Link Style</Button>

// Size variations
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔧</Button>
```

**Design Features**:

- OKLCH color system integration
- Hover effects with subtle transforms
- Focus-visible rings for accessibility
- Icon variants for toolbar actions

### Input Component

**Implementation**: `@/renderer/components/ui/input.tsx`

```tsx
import { Input } from "@/renderer/components/ui/input";

<Input
  placeholder="Search agents..."
  className="focus:ring-2 focus:ring-primary"
  aria-label="Search input"
/>;
```

**Features**:

- WCAG 2.1 AA compliant contrast
- Consistent border radius using `--radius` token
- Focus states with ring effects
- Proper ARIA labeling

### Form Components Complete List

**Form Building**: `form`, `label`, `input`, `textarea`, `select`
**Input Variants**: `input-otp`, `checkbox`, `radio-group`
**Interactive**: `switch`, `slider`, `calendar`
**Validation**: Built-in error states and ARIA support

## 🗺️ Navigation Components (7 Components)

### Navigation Menu

**Implementation**: `@/renderer/components/ui/navigation-menu.tsx`

```tsx
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/renderer/components/ui/navigation-menu";

<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Projects</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink>Current Project</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>;
```

### Sidebar Component

**Implementation**: `@/renderer/components/ui/sidebar.tsx`

```tsx
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/renderer/components/ui/sidebar";

// Discord-like sidebar implementation
<SidebarProvider>
  <Sidebar className="bg-sidebar border-sidebar-border">
    <SidebarHeader>
      <h2 className="text-sidebar-foreground">Project Name</h2>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Channels</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton># general</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
</SidebarProvider>;
```

**Design Features**:

- Uses `--sidebar-*` design tokens
- Discord-like visual hierarchy
- Collapsible with animation support
- Integrated with compound patterns

### Navigation Components Complete List

**Primary Navigation**: `navigation-menu`, `sidebar`, `menubar`
**Breadcrumbs**: `breadcrumb`
**Command Interface**: `command`
**Page Navigation**: `pagination`, `tabs`

## 🏇 Layout Components (8 Components)

### Card Component

**Implementation**: `@/renderer/components/ui/card.tsx`

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/renderer/components/ui/card";

// Agent card example from production
<Card className="group hover:scale-[1.01] transition-all">
  <CardHeader>
    <CardTitle>AI Agent Name</CardTitle>
    <CardDescription>Agent description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Agent capabilities and status</p>
  </CardContent>
  <CardFooter>
    <CardAction>
      <Button>Edit Agent</Button>
    </CardAction>
  </CardFooter>
</Card>;
```

**Design Features**:

- Subtle hover animations with scale transforms
- Backdrop blur effects for glass morphism
- Consistent spacing using component tokens
- Interactive states for clickable cards

### Scroll Area Component

**Implementation**: `@/renderer/components/ui/scroll-area.tsx`

```tsx
import { ScrollArea } from "@/renderer/components/ui/scroll-area";

// Used in conversation lists and navigation
<ScrollArea className="flex-1 scrollbar-thin">
  <div className="space-y-2">
    {conversations.map((conversation) => (
      <ConversationItem key={conversation.id} {...conversation} />
    ))}
  </div>
</ScrollArea>;
```

**Custom Scrollbar Styling** (from `globals.css`):

```css
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: oklch(var(--muted-foreground) / 0.2);
  border-radius: 3px;
}
```

### Layout Components Complete List

**Structure**: `card`, `separator`, `scroll-area`, `resizable`
**Overlays**: `sheet`, `drawer`, `aspect-ratio`
**Interactive**: `collapsible`

## 🔔 Feedback Components (8 Components)

### Alert Component

**Implementation**: `@/renderer/components/ui/alert.tsx`

```tsx
import { Alert, AlertDescription, AlertTitle } from "@/renderer/components/ui/alert";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

// Success alert
<Alert className="border-green-500/20 bg-green-500/5">
  <CheckCircle className="h-4 w-4 text-green-600" />
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>
    Agent has been successfully created and activated.
  </AlertDescription>
</Alert>

// Error alert
<Alert variant="destructive">
  <XCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Failed to connect to the LLM provider. Please check your API key.
  </AlertDescription>
</Alert>
```

### Alert Dialog Component

**Implementation**: `@/renderer/components/ui/alert-dialog.tsx`

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/renderer/components/ui/alert-dialog";

// Delete confirmation dialog
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete Agent</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. The agent will be permanently deleted.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>;
```

### Feedback Components Complete List

**Alerts**: `alert`, `alert-dialog`
**Dialogs**: `dialog`, `tooltip`, `hover-card`, `popover`
**Loading**: `progress`, `skeleton`
**Notifications**: Uses `sonner` for toast notifications

## 🏷️ Data Display Components (10 Components)

### Badge Component

**Implementation**: `@/renderer/components/ui/badge.tsx`

```tsx
import { Badge } from "@/renderer/components/ui/badge";

// Status badges from AgentCard implementation
<Badge
  variant={agent.isActive ? "default" : "secondary"}
  className={cn(
    "h-5 px-2 text-xs",
    agent.isActive
      ? "bg-green-500/10 text-green-600 border-green-500/20"
      : "bg-gray-500/10 text-gray-600 border-gray-500/20",
  )}
>
  {agent.isActive ? "Active" : "Inactive"}
</Badge>;

// Busy state indicator
{
  agent.status === "busy" && (
    <Badge variant="secondary" className="h-4 px-1.5 text-xs">
      Busy
    </Badge>
  );
}
```

### Avatar Component

**Implementation**: `@/renderer/components/ui/avatar.tsx`

```tsx
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/renderer/components/ui/avatar";

// Basic avatar usage
<Avatar className="h-8 w-8">
  <AvatarImage src={user.avatar} className="object-cover" />
  <AvatarFallback className="bg-primary/10 text-primary font-medium">
    {user.name.charAt(0).toUpperCase()}
  </AvatarFallback>
</Avatar>;
```

### Table Component

**Implementation**: `@/renderer/components/ui/table.tsx`

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/renderer/components/ui/table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Agent</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Model</TableHead>
      <TableHead>Created</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {agents.map((agent) => (
      <TableRow key={agent.id} className="hover:bg-accent/50">
        <TableCell className="font-medium">{agent.name}</TableCell>
        <TableCell>
          <Badge variant={agent.isActive ? "default" : "secondary"}>
            {agent.status}
          </Badge>
        </TableCell>
        <TableCell className="text-muted-foreground">{agent.model}</TableCell>
        <TableCell className="text-muted-foreground">
          {formatDate(agent.createdAt)}
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>;
```

### Data Display Components Complete List

**Visual Display**: `table`, `badge`, `avatar`, `accordion`, `carousel`
**Data Visualization**: `chart` (with Chart.js integration)
**Content Organization**: `accordion`, `carousel`
**Status Indicators**: `badge`, custom `agent-status`
**User Representation**: `avatar`, custom `profile-avatar`

## 🌐 Custom Extensions (5 Components)

### Profile Avatar Component

**Implementation**: `@/renderer/components/ui/profile-avatar.tsx`

```tsx
import {
  ProfileAvatar,
  ProfileAvatarImage,
  ProfileAvatarStatus,
  ProfileAvatarCounter,
} from "@/renderer/components/ui/profile-avatar";

// Compound component usage in production
<ProfileAvatar size="lg">
  <ProfileAvatarImage
    name={agent.name}
    className="ring-2 ring-primary/10 hover:ring-primary/20"
  />
  <ProfileAvatarStatus
    status={agent.status === "active" ? "online" : "offline"}
    size="sm"
  />
</ProfileAvatar>

// Group avatar with counter
<ProfileAvatar size="md">
  <ProfileAvatarImage name="Team" />
  <ProfileAvatarCounter count={5} />
</ProfileAvatar>
```

**Features**:

- Compound component pattern
- Status indicators with pulse animation
- Counter badges for groups
- Responsive sizing (sm, md, lg)
- Automatic status generation from ID

### Search Filter Bar Component

**Implementation**: `@/renderer/components/ui/search-filter-bar.tsx`

```tsx
import { SearchFilterBar } from "@/renderer/components/ui/search-filter-bar";

// Used in agent management and conversation lists
<SearchFilterBar
  searchValue={search}
  onSearchChange={setSearch}
  searchPlaceholder="Search agents..."
  filterValue={statusFilter}
  onFilterChange={setStatusFilter}
  filterOptions={[
    { value: "all", label: "All Agents" },
    { value: "active", label: "Active Only" },
    { value: "inactive", label: "Inactive Only" },
  ]}
  toggleValue={showArchived}
  onToggleChange={setShowArchived}
  toggleLabel="Show Archived"
  toggleId="show-archived"
  hasFilters={search || statusFilter !== "all" || showArchived}
  onClearFilters={() => {
    setSearch("");
    setStatusFilter("all");
    setShowArchived(false);
  }}
/>;
```

**Features**:

- Debounced search input (300ms)
- Responsive layout with flex wrapping
- WCAG 2.1 AA compliant labeling
- Toggle switch with visual state
- Clear filters functionality

### Agent Status Component

**Implementation**: `@/renderer/components/agent-status/agent-status.tsx`

```tsx
import { AgentStatus } from "@/renderer/components/agent-status/agent-status";

// Used in agent cards and lists
<AgentStatus
  status={agent.status}
  size="sm"
  className="border border-border/50 shadow-sm"
/>;
```

### Custom Extensions Complete List

**Avatar System**: `profile-avatar` (compound component)
**Search Interface**: `search-filter-bar` (complex functional component)
**Agent Interface**: `agent-status`, `agent-card`, `agent-list`
**Navigation**: Custom `sidebar-navigation`, `content-header`

## 🌍 Real-World Component Patterns

### Discord-Like Interface Layout

**Root Sidebar Implementation** (from `root-sidebar.tsx`):

```tsx
// Projects as servers pattern
<nav className="w-12 lg:w-16 bg-sidebar/95 backdrop-blur-md">
  {/* User/Personal Space */}
  <Link to="/user">
    {({ isActive }) => (
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "w-10 h-10 lg:w-12 lg:h-12 rounded-2xl border-2 transition-all",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground border-sidebar-primary rounded-[14px] scale-105"
            : "bg-sidebar-accent/80 border-transparent hover:bg-sidebar-primary",
        )}
      >
        <Avatar className="size-6 lg:size-8">
          <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        {isActive && (
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary-foreground rounded-full" />
        )}
      </Button>
    )}
  </Link>

  {/* Projects List */}
  {projects.map((project) => (
    <ProjectButton key={project.id} project={project} />
  ))}
</nav>
```

### Agent Card Pattern

**Production AgentCard Implementation** (from `agent-card.tsx`):

```tsx
export function AgentCard({ agent, onDelete, onToggleStatus }: AgentCardProps) {
  // Inline model parsing with error handling
  const getModelName = () => {
    if (!agent.modelConfig) return "Unknown Model";
    try {
      const config = JSON.parse(agent.modelConfig);
      return config.model || "Unknown Model";
    } catch {
      return "Invalid Model Config";
    }
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden",
        "bg-card/50 backdrop-blur-sm border border-border/60",
        "transition-all duration-200 ease-out",
        "hover:shadow-md hover:scale-[1.01]",
        "hover:border-primary/30 hover:bg-card/80",
      )}
    >
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-start gap-[var(--spacing-component-md)]">
          <ProfileAvatar size="lg">
            <ProfileAvatarImage
              name={agent.name}
              className="ring-2 ring-primary/10 group-hover:ring-primary/20"
            />
            <ProfileAvatarStatus
              status={agent.status === "active" ? "online" : "offline"}
              size="sm"
            />
          </ProfileAvatar>

          <div className="flex-1 min-w-0">
            <CardTitle className="group-hover:text-primary transition-colors">
              {agent.name}
            </CardTitle>
            <CardDescription>{agent.role}</CardDescription>
          </div>

          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-all"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              {/* Actions menu */}
            </DropdownMenu>
          </CardAction>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-muted-foreground line-clamp-3">
          {agent.backstory || "No backstory provided."}
        </p>

        {agent.modelConfig && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span className="font-medium">{getModelName()}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t bg-card/30">
        <div className="flex items-center justify-between w-full">
          <AgentStatus status={agent.status} size="sm" />
          <time className="text-xs text-muted-foreground">
            {formatDate(agent.createdAt)}
          </time>
        </div>
      </CardFooter>
    </Card>
  );
}
```

### Animation and State Patterns

**Implemented Animations** (from `globals.css`):

```css
/* Conversation item entrance */
@keyframes conversation-item-enter {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Status pulse for active agents */
@keyframes status-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Auth form slide up animation */
@keyframes auth-form-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## 🎨 Advanced Component Patterns

### Agent-Specific Components

**Agent Status Card**

```css
.agent-card {
  position: relative;
  background-color: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  padding: var(--spacing-component-lg);
  transition: all 0.2s ease-out;
}

.agent-card:hover {
  border-color: hsl(var(--ring) / 0.3);
  box-shadow: 0 4px 12px hsl(var(--foreground) / 0.1);
}

.agent-card.active::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background-color: hsl(var(--chart-5));
  border-radius: var(--radius) 0 0 var(--radius);
}

.agent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-component-md);
}

.agent-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: hsl(var(--card-foreground));
}

.agent-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-component-xs);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}
```

**Conversation Message Components**

```css
.message-bubble {
  max-width: 70%;
  padding: var(--spacing-component-md);
  border-radius: var(--radius);
  margin-bottom: var(--spacing-component-sm);
  position: relative;
}

.message-bubble.user {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  margin-left: auto;
  border-bottom-right-radius: 4px;
}

.message-bubble.assistant {
  background-color: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
  margin-right: auto;
  border-bottom-left-radius: 4px;
}

.message-content {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
}

.message-timestamp {
  font-size: var(--font-size-xs);
  color: hsl(var(--muted-foreground));
  margin-top: var(--spacing-component-xs);
}
```

### Data Display Components

**Data Table Design**

```css
.data-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  overflow: hidden;
}

.table-header {
  background-color: hsl(var(--muted));
  border-bottom: 1px solid hsl(var(--border));
}

.table-header th {
  padding: var(--spacing-component-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: hsl(var(--foreground));
  text-align: left;
}

.table-row {
  border-bottom: 1px solid hsl(var(--border));
  transition: background-color 0.1s ease-out;
}

.table-row:hover {
  background-color: hsl(var(--muted) / 0.5);
}

.table-cell {
  padding: var(--spacing-component-md);
  font-size: var(--font-size-sm);
  color: hsl(var(--foreground));
}
```

## 🔧 Implementation Best Practices

### Component Development Guidelines

**Token Usage Rules**

1. **Always use design tokens** - Never hardcode visual values
2. **Maintain consistency** - Use established patterns across components
3. **Test all states** - Verify hover, focus, active, and disabled states
4. **Consider accessibility** - Ensure keyboard navigation and screen reader support

**Performance Considerations**

- Use CSS transitions sparingly and consistently
- Optimize animations for 60fps performance
- Leverage GPU acceleration for transforms
- Consider reduced motion preferences

**Responsive Design**

- Test components across all breakpoints
- Adjust spacing and sizing appropriately
- Maintain touch target sizes on mobile
- Consider component reflow and text wrapping

### Component Documentation Pattern

**Example Component Documentation**

```tsx
## 🔗 Component Integration Guide

### File Organization (Current Structure)

```

src/renderer/components/
ui/ # 48 shadcn/ui components
button.tsx # Form components
input.tsx
card.tsx # Layout components  
 dialog.tsx # Feedback components
table.tsx # Data display
sidebar.tsx # Navigation
profile-avatar.tsx # Custom compound component
search-filter-bar.tsx # Custom functional component

features/
agent/components/ # Feature-specific components
agent-card.tsx # Uses compound patterns
agent-list.tsx # List implementations
agent-form.tsx # Form compositions
layout/components/ # Layout-specific components
navigation/
sidebar-navigation.tsx # Discord-like navigation
content-header.tsx # Page headers
conversation/components/ # Chat interface components
message-bubble.tsx # Chat messages
conversation-list.tsx # Conversation management

````

### Import Patterns (Required)

```tsx
// CORRECT: Absolute imports using @/ alias
import { Button } from "@/renderer/components/ui/button";
import { AgentCard } from "@/renderer/features/agent/components/agent-card";
import { cn } from "@/renderer/lib/utils";

// INCORRECT: Relative imports
import { Button } from "../../../components/ui/button";
````

### Integration with TanStack Router

**Component Usage in Routes** (Production Pattern)

```tsx
// In route files
import { AgentCard } from "@/renderer/features/agent/components/agent-card";

export function AgentsRoute() {
  const { agents } = Route.useLoaderData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-component-lg)]">
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      ))}
    </div>
  );
}
```

---

## 🔗 Related Documentation

### **Production Implementation**

- **[Design System README](./README.md)** - Complete production overview with all 48 components
- **[Design Tokens](./design-tokens.md)** - OKLCH colors and spacing tokens in production use
- **[Compound Components Guide](./compound-components-guide.md)** - Real compound patterns from codebase

### **Visual Standards**

- **[Visual Design Principles](./visual-design-principles.md)** - Discord-like interface philosophy
- **[Color Palette Specification](./color-palette-specification.md)** - Complete OKLCH color system
- **[Layout and Spacing](./layout-and-spacing.md)** - 8px grid system implementation

### **Development Integration**

- **[Coding Standards](../developer/coding-standards.md)** - React function declaration patterns
- **[Code Simplicity Principles](../developer/code-simplicity-principles.md)** - INLINE-FIRST philosophy
- **[Folder Structure](../developer/folder-structure.md)** - Component organization

---

**🎯 Production Reality**: All 48 components are implemented, tested, and in production use. This documentation reflects the actual codebase state, not conceptual designs. Use these patterns as your single source of truth for component implementation in Project Wiz.
