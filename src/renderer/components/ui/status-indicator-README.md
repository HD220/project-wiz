# StatusIndicator Component

Sistema unificado de status indicators para toda a aplicação Project Wiz.

## 🎯 Problema Resolvido

**ANTES:** Inconsistências em toda aplicação:

- **AgentCard**: `bg-chart-2`, `bg-muted-foreground`, `bg-destructive`
- **ProviderCard**: `bg-chart-2`, `bg-muted-foreground` + texto customizado
- **MessageBubble**: Icons com `text-chart-2/80`, `text-destructive/80`
- **Diferentes abordagens**: Dots, badges, text, icons

**DEPOIS:** Sistema unificado com:

- Cores consistentes em toda aplicação
- Três variants que cobrem todos os casos de uso
- Component leve e otimizado
- Suporte completo a acessibilidade

## 📋 Especificações

### Status Types

```typescript
type StatusType = "active" | "inactive" | "busy" | "error";
```

### Status Colors (Unificadas)

- **`active`**: `bg-chart-2` (verde)
- **`inactive`**: `bg-muted-foreground` (cinza)
- **`busy`**: `bg-destructive animate-pulse` (vermelho animado)
- **`error`**: `bg-destructive` (vermelho)

### Sizes (Precisos)

- **`sm`**: `6px` (w-1.5 h-1.5)
- **`md`**: `8px` (w-2 h-2) - default
- **`lg`**: `10px` (w-2.5 h-2.5)

### Variants

- **`dot`**: Apenas o ponto colorido (default)
- **`badge`**: Ponto + texto em badge
- **`text`**: Apenas texto com cor

## 🚀 Uso Básico

```tsx
import { StatusIndicator } from "@/renderer/components/ui/status-indicator";

// Dot simples (uso mais comum)
<StatusIndicator status="active" />

// Badge com tamanho customizado
<StatusIndicator status="busy" variant="badge" size="lg" />

// Texto apenas com acessibilidade
<StatusIndicator
  status="error"
  variant="text"
  aria-label="Connection error detected"
/>

// Com styling customizado
<StatusIndicator
  status="active"
  variant="dot"
  className="border-2 border-card"
/>
```

## 🔄 Casos de Uso Migrados

### 1. AgentCard (Avatar com status dot)

```tsx
// ANTES: Custom CSS logic
<div className={cn(
  "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card",
  agent.status === "active" && "bg-chart-2",
  agent.status === "inactive" && "bg-muted-foreground",
  agent.status === "busy" && "bg-destructive animate-pulse"
)} />

// DEPOIS: StatusIndicator simples
<div className="absolute -bottom-1 -right-1">
  <StatusIndicator
    status={agent.status}
    variant="dot"
    size="md"
    className="border-2 border-card"
  />
</div>
```

### 2. ProviderCard (Badge com status)

```tsx
// ANTES: Complex badge logic
<div className={cn(
  "flex items-center gap-2 px-2 py-1 rounded-md border transition-colors",
  provider.isActive
    ? "bg-chart-2/10 border-chart-2/20 text-chart-2"
    : "bg-muted/50 border-border/40 text-muted-foreground"
)}>
  <div className={cn(
    "w-1.5 h-1.5 rounded-full",
    provider.isActive ? "bg-chart-2" : "bg-muted-foreground"
  )} />
  <span className="text-xs font-medium">
    {provider.isActive ? "Active" : "Inactive"}
  </span>
</div>

// DEPOIS: StatusIndicator badge
<StatusIndicator
  status={provider.isActive ? "active" : "inactive"}
  variant="badge"
  size="sm"
/>
```

### 3. MessageBubble (Text status)

```tsx
// ANTES: Icons with different colors
const statusIcons = {
  sent: <Check className="w-3 h-3 text-muted-foreground/60" />,
  delivered: <CheckCheck className="w-3 h-3 text-chart-2/80" />,
  failed: <Clock className="w-3 h-3 text-destructive/80" />,
};

// DEPOIS: StatusIndicator dot
<StatusIndicator
  status={getMessageStatus(messageState)}
  variant="dot"
  size="sm"
  aria-label={`Message ${messageState}`}
/>;
```

## ♿ Acessibilidade

- **`role="status"`**: Identifica o componente como status indicator
- **`aria-label`**: Descrição acessível automática ou customizada
- **`aria-hidden="true"`**: Dots decorativos em badges não são lidos
- **Contraste adequado**: Todas as cores seguem guidelines WCAG

## 🎨 Design System

### Alinhamento com Tailwind Theme

- Usa cores do design system: `chart-2`, `muted-foreground`, `destructive`
- Compatível com light/dark themes automaticamente
- Sizes consistentes com sistema de spacing do Tailwind

### Performance

- **Inline-first**: Toda lógica no componente (< 15 linhas por função)
- **Zero dependências externas**: Apenas Badge do shadcn/ui
- **Tree-shakeable**: Componente otimizado para bundling

## 🔧 Migração

### Checklist de Migração

- [ ] ✅ Substituir AgentCard custom dots
- [ ] ✅ Substituir ProviderCard text+dot logic
- [ ] ✅ Substituir MessageBubble status icons
- [ ] ✅ Atualizar ConversationItem status logic
- [ ] ✅ Refatorar AgentStatus component
- [ ] ✅ Remover CSS classes obsoletas
- [ ] ✅ Atualizar tipos TypeScript

### Breaking Changes

- Remover tipos `pending`, `success`, `warning`, `loading`
- Substituir por `active`, `inactive`, `busy`, `error`
- Atualizar imports de componentes antigos

## 📁 Arquivos

- **`status-indicator.tsx`**: Componente principal
- **`status-indicator-examples.tsx`**: Exemplos de uso
- **`status-indicator-migration-example.tsx`**: Exemplos de migração

## 🎯 Resultado

✅ **Consistência**: Mesmo visual em toda aplicação  
✅ **Flexibilidade**: 3 variants cobrem todos os contexts  
✅ **Performance**: Component leve e otimizado  
✅ **Accessibility**: Proper aria-labels e role attributes  
✅ **Manutenibilidade**: Single source of truth para status styling  
✅ **INLINE-FIRST**: Segue filosofia do projeto
