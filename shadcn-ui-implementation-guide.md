# GUIA DE IMPLEMENTAÇÃO SHADCN/UI PARA LLMS

## 🎯 OBJETIVO

Este é um guia prático para LLMs implementarem novos componentes shadcn/ui seguindo **EXATAMENTE** os padrões do codebase.

## 🧠 FILOSOFIA DOS COMPONENTES SHADCN/UI

### **1. COMPOSIÇÃO > CONFIGURAÇÃO**

```typescript
// ✅ FILOSOFIA SHADCN - Composição
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição</CardDescription>
  </CardHeader>
  <CardContent>Conteúdo</CardContent>
</Card>

// ❌ ANTI-PADRÃO - Configuração via props
<Card
  title="Título"
  description="Descrição"
  content="Conteúdo"
/>
```

### **2. COMPONENTES AUTO-CONTIDOS**

- **Não dependem de estados externos** para funcionar
- **Aceitam estados externos** quando necessário via props
- **Gerenciam seu próprio estado interno** quando aplicável

```typescript
// ✅ Auto-contido mas flexível
function Component({ value, onChange, ...props }) {
  const [internalValue, setInternalValue] = useState(value);
  const handleChange = onChange || setInternalValue;
  // Funciona controlado OU não-controlado
}
```

### **3. POLIMORFISMO VIA asChild**

- Componentes **não assumem elemento HTML específico**
- **Flexibilidade máxima** via Radix Slot
- **Comportamento consistente** independente do elemento

```typescript
// ✅ Polimórfico - pode ser button, a, div, etc.
<Button asChild>
  <Link to="/dashboard">Dashboard</Link>
</Button>
```

### **4. PROPS GENÉRICAS, NÃO ESPECÍFICAS**

- **React.ComponentProps<"elemento">** em vez de interfaces customizadas
- **Extensibilidade máxima** sem breaking changes
- **TypeScript safety** sem rigidez excessiva

```typescript
// ✅ CORRETO - Genérico e extensível
function Component({ className, ...props }: React.ComponentProps<"div">) {}

// ❌ ERRADO - Específico e rígido
interface ComponentProps {
  title: string;
  description: string;
  onClick: () => void;
}
```

### **5. CO-LOCALIZAÇÃO DE FUNCIONALIDADES**

- **Componentes relacionados no mesmo arquivo**
- **Não separar** o que não pode ser reutilizado isoladamente
- **Facilita manutenção** e descoberta

```typescript
// ✅ CORRETO - Tudo relacionado junto
// dialog.tsx
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle };

// ❌ ERRADO - Fragmentação desnecessária
// dialog.tsx, dialog-trigger.tsx, dialog-content.tsx...
```

### **6. INVERSION OF CONTROL**

- Componentes **fornecem estrutura**, não controlam uso
- **Usuário decide** como compor e usar
- **Máxima flexibilidade** sem opinião sobre implementação

### **7. HEADLESS UI PHILOSOPHY**

- **Funcionalidade separada de apresentação**
- **Radix UI fornece comportamento**, shadcn fornece estilos
- **Customização total** sem perder funcionalidade

### **8. DESIGN SYSTEM CONSISTENTE**

- **Tokens semânticos** (primary, destructive, muted)
- **Espaçamento sistemático** (gap-2, p-4, px-6)
- **Estados consistentes** (hover, focus, disabled)

### **9. ACCESSIBILITY FIRST**

- **Não é adicionado depois**, está no core
- **Screen readers** considerados desde o início
- **Keyboard navigation** funciona naturalmente

### **10. DEVELOPER EXPERIENCE**

- **Padrões consistentes** reduzem carga cognitiva
- **Autocomplete funciona** via TypeScript genéricos
- **Erros claros** via validação de contexto

### **11. PROGRESSIVE DISCLOSURE**

- **Começam simples**, complexidade é opcional
- **API mínima** para caso básico
- **Extensibilidade** quando necessário

```typescript
// ✅ Simples por padrão
<Button>Click me</Button>

// ✅ Complexo quando necessário
<Button variant="destructive" size="lg" asChild>
  <Link to="/delete">Delete</Link>
</Button>
```

### **12. CONTROLLED vs UNCONTROLLED**

- **Suporte nativo** para ambos os padrões
- **Não força** uma abordagem específica
- **Flexibilidade máxima** para diferentes casos de uso

```typescript
// ✅ Uncontrolled (interno)
<Input defaultValue="test" />

// ✅ Controlled (externo)
<Input value={value} onChange={setValue} />
```

### **13. FAIL-SAFE DEFAULTS**

- **Sempre funcionam** sem configuração
- **Valores padrão sensatos** em variants
- **Degradação elegante** quando props faltam

```typescript
// ✅ Sempre tem padrões seguros
const buttonVariants = cva("base-classes", {
  defaultVariants: {
    variant: "default", // ← Sempre tem padrão
    size: "default", // ← Sempre tem padrão
  },
});
```

### **14. CONTEXT ISOLATION**

- **Contexts não vazam** entre componentes
- **Validação de contexto** obrigatória
- **Erro claro** quando usado incorretamente

```typescript
// ✅ Contexto isolado e validado
function useFormField() {
  const context = React.useContext(FormFieldContext);
  if (!context) {
    throw new Error("useFormField must be used within <FormField>");
  }
  return context;
}
```

### **15. CSS-IN-TS PHILOSOPHY**

- **Classes CSS**, não objetos style
- **Design tokens** via CSS variables
- **Tailwind-first** approach
- **Runtime zero** para estilos

```typescript
// ✅ CORRETO - Classes CSS
className={cn("bg-primary text-primary-foreground", className)}

// ❌ ERRADO - Objetos style
style={{ backgroundColor: 'blue', color: 'white' }}
```

### **16. VARIANT-DRIVEN DESIGN**

- **CVA para variações sistemáticas**
- **Não booleanos** para variações (variant="outline" vs outlined={true})
- **Composabilidade** de variants

```typescript
// ✅ CORRETO - Variants sistemáticos
variant: "default" | "destructive" | "outline" | "secondary"
size: "default" | "sm" | "lg" | "icon"

// ❌ ERRADO - Props booleanos
outlined?: boolean
large?: boolean
destructive?: boolean
```

### **17. PERFORMANCE BY DEFAULT**

- **useMemo/useCallback** quando necessário
- **Evita re-renders** desnecessários
- **Context optimization** via useMemo

```typescript
// ✅ Performance otimizada
const contextValue = React.useMemo(
  () => ({
    state,
    actions,
  }),
  [state, actions],
);
```

### **18. MOBILE-FIRST RESPONSIVE**

- **Funciona mobile** por padrão
- **Enhanced** para desktop
- **Touch-friendly** sempre

```typescript
// ✅ Mobile-first approach
"text-sm sm:text-base"; // Pequeno mobile, normal desktop
"flex-col sm:flex-row"; // Stack mobile, row desktop
```

## 🎨 PRINCÍPIOS DE DESIGN IDENTIFICADOS

### **MINIMAL VIABLE COMPONENT**

- **Apenas o essencial** para funcionar
- **Sem features** que não são amplamente necessárias
- **Extensível** quando casos específicos surgem

### **SEMANTIC OVER VISUAL**

- Props semânticos: `variant="destructive"` não `variant="red"`
- Classes semânticas: `bg-primary` não `bg-blue-500`
- **Significado > Aparência**

### **COMPOSABLE BY NATURE**

- Componentes **funcionam juntos** naturalmente
- **Não conflitam** quando combinados
- **Harmonia visual** automática

### **PREDICTABLE BEHAVIOR**

- **Mesma prop, mesmo comportamento** em todos os componentes
- **Padrões consistentes** (size, variant, disabled)
- **Sem surpresas** para o desenvolvedor

### **ESCAPE HATCHES**

- **className sempre disponível** para customização
- **asChild** para polimorfismo
- **...props** para extensibilidade HTML

### **RENDER PROPS PATTERN**

- **Para casos complexos** onde composição não é suficiente
- **Performance-critical** components (Virtual Lists, Data Tables)
- **Flexibilidade máxima** no rendering

```typescript
// ✅ CORRETO - Render props para flexibilidade
<VirtualList
  items={items}
  renderItem={(item, index) => <ItemComponent key={index} {...item} />}
  getItemHeight={(index) => heights[index]}
/>

// ✅ CORRETO - Index functions para otimização
<DataTable
  data={data}
  keyFn={(item) => item.id}
  renderRow={(row, index) => <TableRow key={row.id} {...row} />}
/>
```

### **INVISIBLE COMPLEXITY**

- **Simples de usar**, complexo internamente
- **Abstrações funcionam** sem entender implementação
- **Defaults inteligentes** resolvem 80% dos casos

## 🚨 REGRAS OBRIGATÓRIAS

### 1. **ESTRUTURA DE IMPORTS (ORDEM FIXA)**

```typescript
import * as React from "react"; // SEMPRE primeiro
import * as ComponentPrimitive from "@radix-ui/react-component"; // Radix (se usar)
import { IconName } from "lucide-react"; // Ícones (se usar)
import { cva, type VariantProps } from "class-variance-authority"; // CVA (se usar)
import { Slot } from "@radix-ui/react-slot"; // Slot (se usar asChild)

import { cn } from "@/renderer/lib/utils"; // SEMPRE último
```

### 2. **data-slot OBRIGATÓRIO**

```typescript
// TODOS os componentes DEVEM ter data-slot
<div data-slot="component-name" />
<SomeComponent data-slot="sub-component-name" />

// Use kebab-case
data-slot="dropdown-menu-item"  // ✅ CORRETO
data-slot="dropdownMenuItem"    // ❌ ERRADO
```

### 3. **FUNCTION DECLARATIONS ONLY**

```typescript
// ✅ CORRETO
function ComponentName({ className, ...props }) {
  // implementation
}

// ❌ ERRADO - NUNCA usar
const ComponentName = () => {};
export const ComponentName: React.FC = () => {};
```

### 4. **PROPS DESTRUCTURING**

```typescript
// ✅ CORRETO
function Component({ className, variant, size, ...props }) {
  // implementation
}

// ❌ ERRADO
function Component(props) {
  // implementation
}
```

### 5. **cn() HELPER SEMPRE**

```typescript
// ✅ CORRETO
className={cn("base-classes", className)}
className={cn(componentVariants({ variant }), className)}

// ❌ ERRADO
className={`base-classes ${className}`}
className="hardcoded-classes"
```

### 6. **EXPORTS NO FINAL**

```typescript
// ✅ CORRETO - Final do arquivo
export { Component, ComponentSub, componentVariants };

// ❌ ERRADO - Inline
export const Component = () => {};
```

## 📝 TEMPLATES DE IMPLEMENTAÇÃO

### **Template 1: Radix Wrapper Simples**

```typescript
import * as ComponentPrimitive from "@radix-ui/react-component";

function Component({
  ...props
}: React.ComponentProps<typeof ComponentPrimitive.Root>) {
  return <ComponentPrimitive.Root data-slot="component" {...props} />;
}

export { Component };
```

### **Template 2: HTML Component com Classes**

```typescript
import * as React from "react";
import { cn } from "@/renderer/lib/utils";

function Component({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="component"
      className={cn("base-classes-here", className)}
      {...props}
    />
  );
}

export { Component };
```

### **Template 3: Component com CVA Variants**

```typescript
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/renderer/lib/utils";

const componentVariants = cva(
  "base-classes-shared-by-all-variants",
  {
    variants: {
      variant: {
        default: "default-variant-classes",
        destructive: "destructive-variant-classes",
        outline: "outline-variant-classes",
      },
      size: {
        default: "default-size-classes",
        sm: "small-size-classes",
        lg: "large-size-classes",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Component({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof componentVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="component"
      className={cn(componentVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Component, componentVariants };
```

### **Template 4: Compound Components**

```typescript
import * as React from "react";
import * as ComponentPrimitive from "@radix-ui/react-component";
import { cn } from "@/renderer/lib/utils";

function Component({
  ...props
}: React.ComponentProps<typeof ComponentPrimitive.Root>) {
  return <ComponentPrimitive.Root data-slot="component" {...props} />;
}

function ComponentTrigger({
  ...props
}: React.ComponentProps<typeof ComponentPrimitive.Trigger>) {
  return <ComponentPrimitive.Trigger data-slot="component-trigger" {...props} />;
}

function ComponentContent({
  className,
  ...props
}: React.ComponentProps<typeof ComponentPrimitive.Content>) {
  return (
    <ComponentPrimitive.Portal>
      <ComponentPrimitive.Content
        data-slot="component-content"
        className={cn("content-base-classes", className)}
        {...props}
      />
    </ComponentPrimitive.Portal>
  );
}

export { Component, ComponentTrigger, ComponentContent };
```

### **Template 5: Components com Context**

```typescript
import * as React from "react";
import { cn } from "@/renderer/lib/utils";

type ComponentContextProps = {
  // context properties
};

const ComponentContext = React.createContext<ComponentContextProps | null>(null);

function useComponent() {
  const context = React.useContext(ComponentContext);
  if (!context) {
    throw new Error("useComponent must be used within a <ComponentProvider />");
  }
  return context;
}

function ComponentProvider({
  children,
  ...props
}: React.ComponentProps<"div"> & {
  // provider specific props
}) {
  const contextValue = React.useMemo<ComponentContextProps>(() => ({
    // context values
  }), [/* dependencies */]);

  return (
    <ComponentContext.Provider value={contextValue}>
      <div data-slot="component-provider" {...props}>
        {children}
      </div>
    </ComponentContext.Provider>
  );
}

export { ComponentProvider, useComponent };
```

### **Template 6: Virtual List / Performance-Critical Components**

```typescript
import * as React from "react";
import { cn } from "@/renderer/lib/utils";

type VirtualListProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemHeight?: (index: number) => number;
  keyFn?: (item: T, index: number) => string | number;
  className?: string;
} & Omit<React.ComponentProps<"div">, 'children'>;

function VirtualList<T>({
  items,
  renderItem,
  getItemHeight = () => 50,
  keyFn = (_, index) => index,
  className,
  ...props
}: VirtualListProps<T>) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [startIndex, setStartIndex] = React.useState(0);
  const [endIndex, setEndIndex] = React.useState(10);

  // Virtual scrolling logic...
  const visibleItems = React.useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, idx) => {
      const actualIndex = startIndex + idx;
      return {
        key: keyFn(item, actualIndex),
        element: renderItem(item, actualIndex),
        height: getItemHeight(actualIndex),
      };
    });
  }, [items, startIndex, endIndex, renderItem, keyFn, getItemHeight]);

  return (
    <div
      ref={containerRef}
      data-slot="virtual-list"
      className={cn("overflow-auto", className)}
      {...props}
    >
      <div data-slot="virtual-list-content">
        {visibleItems.map(({ key, element, height }) => (
          <div
            key={key}
            data-slot="virtual-list-item"
            style={{ height }}
          >
            {element}
          </div>
        ))}
      </div>
    </div>
  );
}

export { VirtualList };
```

## 🎨 CLASSES CSS ESSENCIAIS

### **Design System Classes**

```typescript
// Colors
"bg-primary text-primary-foreground";
"bg-secondary text-secondary-foreground";
"bg-destructive text-white";
"bg-muted text-muted-foreground";
"bg-accent text-accent-foreground";
"bg-popover text-popover-foreground";
"bg-card text-card-foreground";
"bg-background text-foreground";

// Interactive States
"hover:bg-primary/90";
"hover:bg-accent hover:text-accent-foreground";
"focus-visible:ring-ring/50 focus-visible:ring-[3px]";
"focus-visible:border-ring focus-visible:outline-hidden";
"disabled:pointer-events-none disabled:opacity-50";

// Form States
"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40";
"aria-invalid:border-destructive";

// Borders & Shadows
"border-input rounded-md shadow-xs";
"border border-transparent";

// Dark Mode
"dark:bg-input/30";
"dark:hover:bg-input/50";
"dark:text-muted-foreground";
```

### **Radix State Classes**

```typescript
// Data States
"data-[state=open]:bg-accent";
"data-[state=checked]:bg-primary";
"data-[disabled]:pointer-events-none data-[disabled]:opacity-50";
"data-[selected=true]:bg-muted";

// Animations
"data-[state=open]:animate-in data-[state=closed]:animate-out";
"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0";
"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95";
"data-[side=bottom]:slide-in-from-top-2";
```

## 🧩 PADRÕES ESPECÍFICOS

### **Input Components**

```typescript
"border-input dark:bg-input/30";
"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";
"placeholder:text-muted-foreground";
"disabled:cursor-not-allowed disabled:opacity-50";
```

### **Menu Components**

```typescript
"focus:bg-accent focus:text-accent-foreground";
"[&_svg:not([class*='text-'])]:text-muted-foreground";
"data-[inset]:pl-8";
"data-[variant=destructive]:text-destructive";
```

### **Overlay Components**

```typescript
// Portal Pattern OBRIGATÓRIO
<ComponentPrimitive.Portal>
  <ComponentPrimitive.Overlay />
  <ComponentPrimitive.Content>
    {children}
  </ComponentPrimitive.Content>
</ComponentPrimitive.Portal>

// Overlay Classes
"fixed inset-0 z-50 bg-black/50"
"data-[state=open]:animate-in data-[state=closed]:animate-out"
```

### **Button-like Components**

```typescript
"inline-flex items-center justify-center gap-2";
"rounded-md text-sm font-medium";
"transition-colors";
"disabled:pointer-events-none disabled:opacity-50";
"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";
```

### **Performance-Critical Components**

```typescript
// Virtual Lists, Data Tables, etc.
"overflow-auto will-change-scroll";
"contain-layout contain-style";
"transform-gpu"; // Para animações smooth
"backface-visibility-hidden"; // Otimização de rendering

// Container queries para responsividade
"@container/list (min-width: 768px)";
"@supports (container-type: inline-size)";
```

### **Render Props Patterns**

```typescript
// ✅ QUANDO USAR render props
interface DataComponentProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyFn?: (item: T, index: number) => string | number;
  // Funções para otimização/customização
  getItemHeight?: (index: number) => number;
  isItemSelected?: (item: T, index: number) => boolean;
  onItemClick?: (item: T, index: number) => void;
}

// ✅ QUANDO NÃO USAR render props (prefira composição)
// Para estruturas simples que podem ser compostas
<Card>
  <CardHeader>...</CardHeader>
  <CardContent>...</CardContent>
</Card>
```

## 🔧 ACCESSIBILITY PATTERNS

### **ARIA Attributes**

```typescript
// Sempre incluir quando aplicável
role="alert" | "navigation" | "button" | "dialog"
aria-label="descriptive text"
aria-describedby="element-id"
aria-invalid={!!error}
aria-current="page" | undefined
aria-hidden="true" | "false"
```

### **Screen Reader Text**

```typescript
// Sempre para ações de close/toggle
<span className="sr-only">Close</span>
<span className="sr-only">Toggle</span>
<span className="sr-only">Previous slide</span>
```

## ⚠️ NÃO FAZER

```typescript
// ❌ Arrow functions
const Component = () => {}

// ❌ React.FC
export const Component: React.FC = () => {}

// ❌ Missing data-slot
<div className="..." {...props} />

// ❌ Hardcoded className
<div className="bg-blue-500 text-white" />

// ❌ Wrong import order
import { cn } from "@/renderer/lib/utils";
import * as React from "react";

// ❌ Props without destructuring
function Component(props) {}

// ❌ Missing cn() helper
className={`base ${className}`}

// ❌ Inline exports
export const Component = () => {}
```

**LEMBRE-SE:** Consistência > Inovação. Siga os padrões existentes religiosamente.

---

## 🔍 META-PADRÕES IDENTIFICADOS

### **ARQUITETURA EM CAMADAS**

1. **Radix Layer**: Funcionalidade e acessibilidade
2. **Shadcn Layer**: Estilos e padrões visuais

### **TAXONOMIA DE COMPONENTES**

1. **Primitivos**: Button, Input, Label (blocos básicos)
2. **Compostos**: Card, Dialog, Form (combinações)
3. **Layouts**: Sidebar, Resizable (estruturais)
4. **Feedback**: Alert, Progress, Skeleton (informacionais)
5. **Navigation**: Tabs, Breadcrumb, Menu (navegacionais)

### **PATTERNS DE EVOLUÇÃO**

1. **Começar simples**: Primitive wrapper
2. **Adicionar styling**: Classes + cn()
3. **Adicionar variants**: CVA quando necessário
4. **Adicionar composição**: Sub-components
5. **Adicionar context**: Para casos complexos

### **DESIGN CONSTRAINTS**

- **Nunca quebrar** props existentes
- **Sempre manter** backward compatibility
- **Priorizar** casos de uso comuns
- **Abstrair** complexidades técnicas
- **Documentar** via tipos TypeScript

### **FILOSOFIA DE CONTRIBUIÇÃO**

- **Copy > Create**: Copie padrões existentes
- **Compose > Configure**: Prefira composição
- **Extend > Replace**: Estenda, não substitua
- **Generic > Specific**: Mantenha genérico
- **Consistent > Creative**: Seja consistente

### **EXCEÇÕES PARA PERFORMANCE**

Alguns padrões quebram convenções shadcn quando **performance é crítica**:

#### **Render Props vs Composição**

```typescript
// ✅ PADRÃO SHADCN - Composição (maioria dos casos)
<List>
  {items.map(item => <ListItem key={item.id}>{item.name}</ListItem>)}
</List>

// ✅ EXCEÇÃO - Render props (performance crítica)
<VirtualList
  items={items}
  renderItem={(item, index) => <ListItem key={item.id}>{item.name}</ListItem>}
  keyFn={(item) => item.id}
/>
```

#### **Function Props vs Variants**

```typescript
// ✅ PADRÃO SHADCN - Variants fixos
<Button variant="destructive" size="lg" />

// ✅ EXCEÇÃO - Function props (customização dinâmica)
<DataTable
  getRowClassName={(row, index) =>
    row.isActive ? "bg-green-50" : "bg-gray-50"
  }
  getCellContent={(row, column) => formatCell(row[column])}
/>
```

#### **Quando usar cada padrão:**

- **Composição**: Estruturas visuais fixas (Card, Dialog, Form)
- **Render Props**: Listas virtuais, tabelas de dados, grids
- **Function Props**: Formatação dinâmica, estilos condicionais
- **Variants**: Estados visuais limitados e conhecidos

Esta é a **mentalidade** por trás de cada decisão nos componentes shadcn/ui.
