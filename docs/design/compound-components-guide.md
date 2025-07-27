# Compound Components Guide

This document provides a comprehensive technical guide for creating Compound Components in the Project Wiz Design System. It focuses on the architecture, patterns, and implementation strategies for building maintainable and type-safe compound components.

## 📋 Table of Contents

- [What are Compound Components](#what-are-compound-components)
- [Technical Architecture](#technical-architecture)
- [Implementation Patterns](#implementation-patterns)
- [Step-by-Step Implementation](#step-by-step-implementation)
- [Practical Examples](#practical-examples)
- [TypeScript Patterns](#typescript-patterns)
- [Best Practices](#best-practices)

## What are Compound Components

### Definition

Compound Components are a React pattern where multiple components work together to form a cohesive unit. Each component handles a specific part of the overall functionality while sharing state and behavior through a parent-child relationship.

**Key Characteristics:**

- Multiple related components that work together
- Shared state managed by a root component
- Flexible composition while maintaining consistency
- Clear separation of concerns between sub-components

### Advantages for Project Wiz

**1. Flexible Composition**

```tsx
// ✅ Flexible: Components can be composed in different ways
<FeatureCard variant="premium">
  <FeatureCardHeader>
    <FeatureCardIcon />
    <FeatureCardTitle>Advanced AI</FeatureCardTitle>
  </FeatureCardHeader>
  <FeatureCardContent>
    <FeatureCardDescription>...</FeatureCardDescription>
    <FeatureCardBadge>New</FeatureCardBadge>
  </FeatureCardContent>
  <FeatureCardFooter>
    <FeatureCardAction>Upgrade</FeatureCardAction>
  </FeatureCardFooter>
</FeatureCard>

// ✅ Different composition for different contexts
<FeatureCard variant="basic">
  <FeatureCardHeader>
    <FeatureCardTitle>Basic Features</FeatureCardTitle>
  </FeatureCardHeader>
  <FeatureCardContent>
    <FeatureCardDescription>...</FeatureCardDescription>
  </FeatureCardContent>
</FeatureCard>
```

**2. Consistency with Flexibility**

- Maintains design system consistency
- Allows contextual customization
- Prevents component API explosion
- Easier to maintain and update

**3. Better Developer Experience**

- Intuitive API based on HTML-like structure
- Clear component hierarchy
- IDE autocompletion support
- Type safety throughout the component tree

### When to Use vs Simple Components

**✅ Use Compound Components When:**

- Component has multiple distinct sections (header, content, footer)
- Different layouts/compositions are needed
- Sub-components share state or behavior
- Component complexity would create prop explosion

**❌ Use Simple Components When:**

- Single responsibility component
- No internal state sharing needed
- Simple configuration through props is sufficient
- Component is used in only one way

## Technical Architecture

### Context-Based Communication

Compound components use React Context to share state and behavior between the root component and its children.

```tsx
// Context definition
interface FeatureCardContextValue {
  variant: "basic" | "premium" | "enterprise";
  isDisabled: boolean;
  onAction?: () => void;
}

const FeatureCardContext = React.createContext<FeatureCardContextValue | null>(
  null,
);

// Hook for accessing context
function useFeatureCard() {
  const context = React.useContext(FeatureCardContext);
  if (!context) {
    throw new Error("FeatureCard components must be used within <FeatureCard>");
  }
  return context;
}
```

### Component Hierarchy Structure

```tsx
// Root component provides context
function FeatureCard({ children, variant, onAction, disabled }) {
  const contextValue = {
    variant,
    isDisabled: disabled,
    onAction,
  };

  return (
    <FeatureCardContext.Provider value={contextValue}>
      <div className={cardVariants({ variant })}>{children}</div>
    </FeatureCardContext.Provider>
  );
}

// Sub-components consume context
function FeatureCardAction({ children, ...props }) {
  const { variant, isDisabled, onAction } = useFeatureCard();

  return (
    <Button
      variant={variant === "premium" ? "default" : "outline"}
      disabled={isDisabled}
      onClick={onAction}
      {...props}
    >
      {children}
    </Button>
  );
}
```

### Export Patterns

**Individual Components (Recommended for Project Wiz):**

```tsx
// ✅ Preferred: Clear naming, individual components
export {
  FeatureCard,
  FeatureCardHeader,
  FeatureCardTitle,
  FeatureCardContent,
  FeatureCardFooter,
  FeatureCardAction,
};

// Usage
<FeatureCard>
  <FeatureCardHeader>
    <FeatureCardTitle>Title</FeatureCardTitle>
  </FeatureCardHeader>
</FeatureCard>;
```

**Alternative Export Structure:**

```tsx
// ✅ Alternative: Named exports with type safety
export {
  FeatureCard as FeatureCardRoot,
  FeatureCardHeader,
  FeatureCardTitle,
  FeatureCardIcon,
  FeatureCardContent,
  FeatureCardDescription,
  FeatureCardFooter,
  FeatureCardAction,
  type FeatureCardProps,
};
```

## Implementation Patterns

### CVA Integration

Compound components integrate seamlessly with Class Variance Authority (CVA) for consistent styling:

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/renderer/lib/utils";

// Define variants for the root component
const featureCardVariants = cva(
  // Base styles
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        basic: "border-border",
        premium: "border-primary bg-primary/5",
        enterprise: "border-gradient-to-r from-purple-500 to-pink-500",
      },
      size: {
        default: "p-6",
        compact: "p-4",
        large: "p-8",
      },
    },
    defaultVariants: {
      variant: "basic",
      size: "default",
    },
  },
);

// Sub-component styles that respond to root variants
const featureCardActionVariants = cva("transition-colors", {
  variants: {
    rootVariant: {
      basic: "text-primary hover:text-primary/80",
      premium: "text-primary-foreground bg-primary hover:bg-primary/90",
      enterprise: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    },
  },
});
```

### forwardRef and asChild Patterns

Following Radix UI patterns for maximum flexibility:

```tsx
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

interface FeatureCardActionProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

const FeatureCardAction = React.forwardRef<
  HTMLButtonElement,
  FeatureCardActionProps
>(({ asChild = false, className, ...props }, ref) => {
  const { variant, isDisabled } = useFeatureCard();
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      data-slot="feature-card-action"
      className={cn(
        featureCardActionVariants({ rootVariant: variant }),
        className,
      )}
      disabled={isDisabled}
      {...props}
    />
  );
});

FeatureCardAction.displayName = "FeatureCardAction";
```

### Data Attributes for Styling

Using `data-slot` attributes for consistent styling and debugging:

```tsx
function FeatureCardHeader({ className, ...props }) {
  return (
    <div
      data-slot="feature-card-header"
      className={cn("flex items-center justify-between pb-2", className)}
      {...props}
    />
  );
}
```

## Step-by-Step Implementation

### Step 1: Define the Context Interface

```tsx
interface FeatureCardContextValue {
  // Variants and styling
  variant: "basic" | "premium" | "enterprise";
  size: "default" | "compact" | "large";

  // State
  isDisabled: boolean;
  isLoading: boolean;

  // Callbacks
  onAction?: () => void;
  onSecondaryAction?: () => void;

  // Feature flags
  showBadge: boolean;
  showIcon: boolean;
}

const FeatureCardContext = React.createContext<FeatureCardContextValue | null>(
  null,
);
```

### Step 2: Create the Context Hook

```tsx
function useFeatureCard() {
  const context = React.useContext(FeatureCardContext);

  if (!context) {
    throw new Error("FeatureCard components must be used within <FeatureCard>");
  }

  return context;
}
```

### Step 3: Implement the Root Component

```tsx
interface FeatureCardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof featureCardVariants> {
  onAction?: () => void;
  onSecondaryAction?: () => void;
  disabled?: boolean;
  loading?: boolean;
  showBadge?: boolean;
  showIcon?: boolean;
}

function FeatureCardRoot({
  children,
  className,
  variant = "basic",
  size = "default",
  onAction,
  onSecondaryAction,
  disabled = false,
  loading = false,
  showBadge = false,
  showIcon = true,
  ...props
}: FeatureCardProps) {
  const contextValue: FeatureCardContextValue = {
    variant,
    size,
    isDisabled: disabled,
    isLoading: loading,
    onAction,
    onSecondaryAction,
    showBadge,
    showIcon,
  };

  return (
    <FeatureCardContext.Provider value={contextValue}>
      <div
        data-slot="feature-card"
        className={cn(featureCardVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </div>
    </FeatureCardContext.Provider>
  );
}
```

### Step 4: Implement Sub-Components

```tsx
// Header Component
function FeatureCardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="feature-card-header"
      className={cn(
        "flex items-center justify-between border-b border-border pb-3 mb-4",
        className,
      )}
      {...props}
    />
  );
}

// Title Component
function FeatureCardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  const { variant } = useFeatureCard();

  return (
    <h3
      data-slot="feature-card-title"
      className={cn(
        "font-semibold leading-none tracking-tight",
        variant === "premium" && "text-primary",
        variant === "enterprise" &&
          "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent",
        className,
      )}
      {...props}
    />
  );
}

// Icon Component
function FeatureCardIcon({ className, ...props }: React.ComponentProps<"div">) {
  const { variant, showIcon } = useFeatureCard();

  if (!showIcon) return null;

  return (
    <div
      data-slot="feature-card-icon"
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg",
        variant === "basic" && "bg-muted",
        variant === "premium" && "bg-primary/10 text-primary",
        variant === "enterprise" &&
          "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
        className,
      )}
      {...props}
    />
  );
}

// Content Component
function FeatureCardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="feature-card-content"
      className={cn("space-y-3", className)}
      {...props}
    />
  );
}

// Action Component with forwardRef
const FeatureCardAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean }
>(({ asChild = false, className, onClick, ...props }, ref) => {
  const { variant, isDisabled, isLoading, onAction } = useFeatureCard();
  const Comp = asChild ? Slot : "button";

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (onClick) {
      onClick(event);
    } else if (onAction) {
      onAction();
    }
  }

  return (
    <Comp
      ref={ref}
      data-slot="feature-card-action"
      className={cn(
        buttonVariants({
          variant: variant === "premium" ? "default" : "outline",
          size: "sm",
        }),
        className,
      )}
      disabled={isDisabled || isLoading}
      onClick={handleClick}
      {...props}
    />
  );
});

FeatureCardAction.displayName = "FeatureCardAction";
```

### Step 5: Create the Export Structure

```tsx
const FeatureCard = {
  Root: FeatureCardRoot,
  Header: FeatureCardHeader,
  Icon: FeatureCardIcon,
  Title: FeatureCardTitle,
  Content: FeatureCardContent,
  Description: FeatureCardDescription,
  Badge: FeatureCardBadge,
  Footer: FeatureCardFooter,
  Action: FeatureCardAction,
  SecondaryAction: FeatureCardSecondaryAction,
};

export { FeatureCard, type FeatureCardProps };

// For backward compatibility, also export as default root
export { FeatureCardRoot as FeatureCard };
```

## Practical Examples

### Example 1: Simple StatusIndicator

**Use Case**: Display status with icon, text, and optional actions.

```tsx
// status-indicator.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/renderer/lib/utils";

interface StatusIndicatorContextValue {
  status: "success" | "warning" | "error" | "info";
  size: "sm" | "md" | "lg";
  showIcon: boolean;
  onAction?: () => void;
}

const StatusIndicatorContext =
  React.createContext<StatusIndicatorContextValue | null>(null);

function useStatusIndicator() {
  const context = React.useContext(StatusIndicatorContext);
  if (!context) {
    throw new Error(
      "StatusIndicator components must be used within <StatusIndicator>",
    );
  }
  return context;
}

const statusIndicatorVariants = cva(
  "inline-flex items-center gap-2 rounded-lg border px-3 py-2",
  {
    variants: {
      status: {
        success: "border-green-200 bg-green-50 text-green-800",
        warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
        error: "border-red-200 bg-red-50 text-red-800",
        info: "border-blue-200 bg-blue-50 text-blue-800",
      },
      size: {
        sm: "text-xs px-2 py-1",
        md: "text-sm px-3 py-2",
        lg: "text-base px-4 py-3",
      },
    },
    defaultVariants: {
      status: "info",
      size: "md",
    },
  },
);

interface StatusIndicatorProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof statusIndicatorVariants> {
  onAction?: () => void;
  showIcon?: boolean;
}

function StatusIndicatorRoot({
  children,
  status = "info",
  size = "md",
  onAction,
  showIcon = true,
  className,
  ...props
}: StatusIndicatorProps) {
  const contextValue = { status, size, showIcon, onAction };

  return (
    <StatusIndicatorContext.Provider value={contextValue}>
      <div
        data-slot="status-indicator"
        className={cn(statusIndicatorVariants({ status, size }), className)}
        {...props}
      >
        {children}
      </div>
    </StatusIndicatorContext.Provider>
  );
}

function StatusIndicatorIcon({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const { status, showIcon } = useStatusIndicator();

  if (!showIcon) return null;

  const icons = {
    success: "✓",
    warning: "⚠",
    error: "✗",
    info: "ℹ",
  };

  return (
    <span
      data-slot="status-indicator-icon"
      className={cn("flex-shrink-0", className)}
      {...props}
    >
      {icons[status]}
    </span>
  );
}

function StatusIndicatorText({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="status-indicator-text"
      className={cn("font-medium", className)}
      {...props}
    />
  );
}

const StatusIndicatorAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, onClick, ...props }, ref) => {
  const { onAction } = useStatusIndicator();

  return (
    <button
      ref={ref}
      data-slot="status-indicator-action"
      className={cn(
        "ml-auto flex-shrink-0 text-xs underline hover:no-underline",
        className,
      )}
      onClick={onClick || onAction}
      {...props}
    />
  );
});

StatusIndicatorAction.displayName = "StatusIndicatorAction";

export {
  StatusIndicator,
  StatusIndicatorIcon,
  StatusIndicatorText,
  StatusIndicatorAction,
  type StatusIndicatorProps,
};

// Alternative: Export root component as StatusIndicatorRoot for clarity
export { StatusIndicatorRoot as StatusIndicator };

// Usage Example
function MyComponent() {
  return (
    <StatusIndicator status="success" onAction={() => console.log("Dismissed")}>
      <StatusIndicatorIcon />
      <StatusIndicatorText>
        Operation completed successfully
      </StatusIndicatorText>
      <StatusIndicatorAction>Dismiss</StatusIndicatorAction>
    </StatusIndicator>
  );
}
```

### Example 2: Medium Complexity DataTable

```tsx
// data-table.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/renderer/lib/utils";

interface DataTableContextValue<T = unknown> {
  data: T[];
  columns: DataTableColumn<T>[];
  variant: "default" | "striped" | "bordered";
  size: "sm" | "md" | "lg";
  isLoading: boolean;
  onRowClick?: (row: T, index: number) => void;
  onRowSelect?: (row: T, selected: boolean) => void;
  selectedRows: Set<number>;
}

interface DataTableColumn<T> {
  key: keyof T;
  header: string;
  cell?: (value: T[keyof T], row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

const DataTableContext = React.createContext<DataTableContextValue | null>(
  null,
);

function useDataTable<T = unknown>() {
  const context = React.useContext(
    DataTableContext,
  ) as DataTableContextValue<T> | null;
  if (!context) {
    throw new Error("DataTable components must be used within <DataTable>");
  }
  return context;
}

const dataTableVariants = cva(
  "w-full border-collapse overflow-hidden rounded-lg border",
  {
    variants: {
      variant: {
        default: "border-border",
        striped: "border-border [&_tbody_tr:nth-child(even)]:bg-muted/50",
        bordered: "border-border [&_td]:border [&_th]:border",
      },
      size: {
        sm: "[&_td]:px-2 [&_td]:py-1 [&_th]:px-2 [&_th]:py-1 text-sm",
        md: "[&_td]:px-4 [&_td]:py-2 [&_th]:px-4 [&_th]:py-2",
        lg: "[&_td]:px-6 [&_td]:py-3 [&_th]:px-6 [&_th]:py-3 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

interface DataTableProps<T>
  extends React.ComponentProps<"table">,
    VariantProps<typeof dataTableVariants> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  onRowClick?: (row: T, index: number) => void;
  onRowSelect?: (row: T, selected: boolean) => void;
}

function DataTableRoot<T>({
  children,
  data,
  columns,
  variant = "default",
  size = "md",
  loading = false,
  onRowClick,
  onRowSelect,
  className,
  ...props
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = React.useState(new Set<number>());

  const contextValue: DataTableContextValue<T> = {
    data,
    columns,
    variant,
    size,
    isLoading: loading,
    onRowClick,
    onRowSelect: (row, selected) => {
      const rowIndex = data.indexOf(row);
      const newSelected = new Set(selectedRows);
      if (selected) {
        newSelected.add(rowIndex);
      } else {
        newSelected.delete(rowIndex);
      }
      setSelectedRows(newSelected);
      onRowSelect?.(row, selected);
    },
    selectedRows,
  };

  return (
    <DataTableContext.Provider value={contextValue}>
      <div className="relative overflow-x-auto">
        <table
          data-slot="data-table"
          className={cn(dataTableVariants({ variant, size }), className)}
          {...props}
        >
          {children}
        </table>
      </div>
    </DataTableContext.Provider>
  );
}

function DataTableHeader({
  className,
  ...props
}: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="data-table-header"
      className={cn("bg-muted/50", className)}
      {...props}
    />
  );
}

function DataTableHeaderRow({
  className,
  ...props
}: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="data-table-header-row"
      className={cn("border-b border-border", className)}
      {...props}
    />
  );
}

function DataTableHeaderCell({
  className,
  ...props
}: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="data-table-header-cell"
      className={cn(
        "text-left font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  );
}

function DataTableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  const { isLoading } = useDataTable();

  if (isLoading) {
    return (
      <tbody>
        <tr>
          <td colSpan={100} className="text-center py-8 text-muted-foreground">
            Loading...
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody
      data-slot="data-table-body"
      className={cn("divide-y divide-border", className)}
      {...props}
    />
  );
}

function DataTableRow({
  index,
  className,
  ...props
}: React.ComponentProps<"tr"> & { index: number }) {
  const { data, onRowClick, selectedRows } = useDataTable();
  const isSelected = selectedRows.has(index);

  return (
    <tr
      data-slot="data-table-row"
      data-selected={isSelected}
      className={cn(
        "transition-colors hover:bg-muted/50",
        isSelected && "bg-muted",
        onRowClick && "cursor-pointer",
        className,
      )}
      onClick={() => onRowClick?.(data[index], index)}
      {...props}
    />
  );
}

function DataTableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="data-table-cell"
      className={cn("text-left [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  );
}

export {
  DataTable,
  DataTableHeader,
  DataTableHeaderRow,
  DataTableHeaderCell,
  DataTableBody,
  DataTableRow,
  DataTableCell,
  type DataTableProps,
  type DataTableColumn,
};

// Alternative: Export root component as DataTableRoot for clarity
export { DataTableRoot as DataTable };
```

### Example 3: Complex FeatureCard

```tsx
// feature-card.tsx - Complete implementation
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/renderer/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface FeatureCardContextValue {
  variant: "basic" | "premium" | "enterprise";
  size: "default" | "compact" | "large";
  isDisabled: boolean;
  isLoading: boolean;
  showBadge: boolean;
  showIcon: boolean;
  onAction?: () => void;
  onSecondaryAction?: () => void;
}

const FeatureCardContext = React.createContext<FeatureCardContextValue | null>(
  null,
);

function useFeatureCard() {
  const context = React.useContext(FeatureCardContext);
  if (!context) {
    throw new Error("FeatureCard components must be used within <FeatureCard>");
  }
  return context;
}

const featureCardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md",
  {
    variants: {
      variant: {
        basic: "border-border",
        premium:
          "border-primary bg-gradient-to-br from-primary/5 to-primary/10",
        enterprise:
          "border-transparent bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 ring-1 ring-gradient-to-r ring-from-purple-500/20 ring-to-pink-500/20",
      },
      size: {
        default: "p-6",
        compact: "p-4",
        large: "p-8",
      },
    },
    defaultVariants: {
      variant: "basic",
      size: "default",
    },
  },
);

interface FeatureCardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof featureCardVariants> {
  onAction?: () => void;
  onSecondaryAction?: () => void;
  disabled?: boolean;
  loading?: boolean;
  showBadge?: boolean;
  showIcon?: boolean;
}

function FeatureCardRoot({
  children,
  className,
  variant = "basic",
  size = "default",
  onAction,
  onSecondaryAction,
  disabled = false,
  loading = false,
  showBadge = false,
  showIcon = true,
  ...props
}: FeatureCardProps) {
  const contextValue: FeatureCardContextValue = {
    variant,
    size,
    isDisabled: disabled,
    isLoading: loading,
    onAction,
    onSecondaryAction,
    showBadge,
    showIcon,
  };

  return (
    <FeatureCardContext.Provider value={contextValue}>
      <div
        data-slot="feature-card"
        className={cn(featureCardVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </div>
    </FeatureCardContext.Provider>
  );
}

function FeatureCardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="feature-card-header"
      className={cn("flex items-start justify-between gap-4 mb-4", className)}
      {...props}
    />
  );
}

function FeatureCardIcon({ className, ...props }: React.ComponentProps<"div">) {
  const { variant, showIcon, size } = useFeatureCard();

  if (!showIcon) return null;

  const iconSizes = {
    compact: "h-8 w-8",
    default: "h-10 w-10",
    large: "h-12 w-12",
  };

  return (
    <div
      data-slot="feature-card-icon"
      className={cn(
        "flex items-center justify-center rounded-lg",
        iconSizes[size],
        variant === "basic" && "bg-muted text-muted-foreground",
        variant === "premium" && "bg-primary/10 text-primary",
        variant === "enterprise" &&
          "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
        className,
      )}
      {...props}
    />
  );
}

function FeatureCardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  const { variant, size } = useFeatureCard();

  const titleSizes = {
    compact: "text-base",
    default: "text-lg",
    large: "text-xl",
  };

  return (
    <h3
      data-slot="feature-card-title"
      className={cn(
        "font-semibold leading-tight tracking-tight",
        titleSizes[size],
        variant === "premium" && "text-primary",
        variant === "enterprise" &&
          "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent",
        className,
      )}
      {...props}
    />
  );
}

function FeatureCardBadge({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const { showBadge, variant } = useFeatureCard();

  if (!showBadge) return null;

  return (
    <span
      data-slot="feature-card-badge"
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
        variant === "basic" && "bg-muted text-muted-foreground",
        variant === "premium" && "bg-primary text-primary-foreground",
        variant === "enterprise" &&
          "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
        className,
      )}
      {...props}
    />
  );
}

function FeatureCardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { size } = useFeatureCard();

  const contentSpacing = {
    compact: "space-y-2",
    default: "space-y-3",
    large: "space-y-4",
  };

  return (
    <div
      data-slot="feature-card-content"
      className={cn("flex-1", contentSpacing[size], className)}
      {...props}
    />
  );
}

function FeatureCardDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  const { size } = useFeatureCard();

  const descriptionSizes = {
    compact: "text-xs",
    default: "text-sm",
    large: "text-base",
  };

  return (
    <p
      data-slot="feature-card-description"
      className={cn("text-muted-foreground", descriptionSizes[size], className)}
      {...props}
    />
  );
}

function FeatureCardFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { size } = useFeatureCard();

  const footerSpacing = {
    compact: "mt-3 gap-2",
    default: "mt-4 gap-3",
    large: "mt-6 gap-4",
  };

  return (
    <div
      data-slot="feature-card-footer"
      className={cn(
        "flex items-center justify-between",
        footerSpacing[size],
        className,
      )}
      {...props}
    />
  );
}

const FeatureCardAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean }
>(({ asChild = false, className, onClick, ...props }, ref) => {
  const { variant, isDisabled, isLoading, onAction, size } = useFeatureCard();
  const Comp = asChild ? Slot : "button";

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (onClick) {
      onClick(event);
    } else if (onAction) {
      onAction();
    }
  }

  const buttonSize =
    size === "compact" ? "sm" : size === "large" ? "lg" : "default";

  return (
    <Comp
      ref={ref}
      data-slot="feature-card-action"
      className={cn(
        buttonVariants({
          variant:
            variant === "enterprise"
              ? "default"
              : variant === "premium"
                ? "default"
                : "outline",
          size: buttonSize,
        }),
        variant === "enterprise" &&
          "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
        className,
      )}
      disabled={isDisabled || isLoading}
      onClick={handleClick}
      {...props}
    />
  );
});

FeatureCardAction.displayName = "FeatureCardAction";

const FeatureCardSecondaryAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean }
>(({ asChild = false, className, onClick, ...props }, ref) => {
  const { isDisabled, isLoading, onSecondaryAction, size } = useFeatureCard();
  const Comp = asChild ? Slot : "button";

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (onClick) {
      onClick(event);
    } else if (onSecondaryAction) {
      onSecondaryAction();
    }
  }

  const buttonSize =
    size === "compact" ? "sm" : size === "large" ? "lg" : "default";

  return (
    <Comp
      ref={ref}
      data-slot="feature-card-secondary-action"
      className={cn(
        buttonVariants({
          variant: "ghost",
          size: buttonSize,
        }),
        className,
      )}
      disabled={isDisabled || isLoading}
      onClick={handleClick}
      {...props}
    />
  );
});

FeatureCardSecondaryAction.displayName = "FeatureCardSecondaryAction";

export {
  FeatureCard,
  FeatureCardHeader,
  FeatureCardIcon,
  FeatureCardTitle,
  FeatureCardBadge,
  FeatureCardContent,
  FeatureCardDescription,
  FeatureCardFooter,
  FeatureCardAction,
  FeatureCardSecondaryAction,
  type FeatureCardProps,
};

// Alternative: Export root component as FeatureCardRoot for clarity
export { FeatureCardRoot as FeatureCard };

// Usage Examples
function FeatureCardExamples() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Basic Feature */}
      <FeatureCard variant="basic">
        <FeatureCardHeader>
          <FeatureCardIcon>🔧</FeatureCardIcon>
          <FeatureCardTitle>Basic Tools</FeatureCardTitle>
        </FeatureCardHeader>
        <FeatureCardContent>
          <FeatureCardDescription>
            Essential development tools for getting started with your projects.
          </FeatureCardDescription>
        </FeatureCardContent>
        <FeatureCardFooter>
          <FeatureCardAction>Get Started</FeatureCardAction>
        </FeatureCardFooter>
      </FeatureCard>

      {/* Premium Feature */}
      <FeatureCard
        variant="premium"
        showBadge
        onAction={() => console.log("Upgrade clicked")}
      >
        <FeatureCardHeader>
          <FeatureCardIcon>⚡</FeatureCardIcon>
          <div>
            <FeatureCardTitle>Pro Features</FeatureCardTitle>
            <FeatureCardBadge>Popular</FeatureCardBadge>
          </div>
        </FeatureCardHeader>
        <FeatureCardContent>
          <FeatureCardDescription>
            Advanced tools and features for professional development teams.
          </FeatureCardDescription>
        </FeatureCardContent>
        <FeatureCardFooter>
          <FeatureCardAction>Upgrade Now</FeatureCardAction>
          <FeatureCardSecondaryAction>Learn More</FeatureCardSecondaryAction>
        </FeatureCardFooter>
      </FeatureCard>

      {/* Enterprise Feature */}
      <FeatureCard variant="enterprise" size="large" showBadge>
        <FeatureCardHeader>
          <FeatureCardIcon>🚀</FeatureCardIcon>
          <div>
            <FeatureCardTitle>Enterprise</FeatureCardTitle>
            <FeatureCardBadge>Best Value</FeatureCardBadge>
          </div>
        </FeatureCardHeader>
        <FeatureCardContent>
          <FeatureCardDescription>
            Complete solution with advanced security, compliance, and dedicated
            support.
          </FeatureCardDescription>
        </FeatureCardContent>
        <FeatureCardFooter>
          <FeatureCardAction>Contact Sales</FeatureCardAction>
          <FeatureCardSecondaryAction>Schedule Demo</FeatureCardSecondaryAction>
        </FeatureCardFooter>
      </FeatureCard>
    </div>
  );
}
```

## TypeScript Patterns

### Context Type Safety

```tsx
// Generic context for type-safe data sharing
interface DataContextValue<TData = unknown> {
  data: TData;
  isLoading: boolean;
  error: Error | null;
}

function createDataContext<TData>() {
  const Context = React.createContext<DataContextValue<TData> | null>(null);

  function useDataContext(): DataContextValue<TData> {
    const context = React.useContext(Context);
    if (!context) {
      throw new Error("useDataContext must be used within a DataProvider");
    }
    return context;
  }

  return { Context, useDataContext };
}

// Usage
const { Context: UserContext, useDataContext: useUserContext } =
  createDataContext<User>();
```

### Prop Type Inheritance

```tsx
// Base props that all sub-components inherit
interface BaseComponentProps {
  className?: string;
  "data-testid"?: string;
}

// Extend HTML element props while maintaining type safety
interface ComponentProps
  extends BaseComponentProps,
    Omit<React.ComponentProps<"div">, keyof BaseComponentProps> {
  variant?: "default" | "secondary";
}

// Conditional props based on context state
interface ConditionalProps {
  mode: "readonly" | "editable";
}

type EditableProps = ConditionalProps & {
  mode: "editable";
  onSave: () => void;
  onCancel: () => void;
};

type ReadonlyProps = ConditionalProps & {
  mode: "readonly";
  onEdit: () => void;
};

type ComponentProps = EditableProps | ReadonlyProps;
```

### Variant Type Safety

```tsx
// Create variant-aware prop types
type VariantProps<T extends Record<string, any>> = {
  [K in keyof T]?: keyof T[K];
};

interface StyledComponentProps extends VariantProps<typeof componentVariants> {
  // Ensure variant props are type-safe
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "outline";
}

// Context that includes variant information
interface VariantContextValue extends StyledComponentProps {
  // Computed values based on variants
  computedSize: number;
  computedClasses: string;
}
```

### Component Ref Forwarding

```tsx
// Generic ref forwarding for compound components
interface RefForwardingProps<T extends React.ElementType> {
  as?: T;
  asChild?: boolean;
}

type PolymorphicProps<T extends React.ElementType> = RefForwardingProps<T> &
  React.ComponentPropsWithoutRef<T>;

function createForwardRefComponent<
  TDefaultElement extends React.ElementType,
  TProps = {},
>(
  render: (
    props: PolymorphicProps<TDefaultElement> & TProps,
    ref: React.ForwardedRef<React.ElementRef<TDefaultElement>>,
  ) => React.ReactElement | null,
) {
  return React.forwardRef(render);
}

// Usage
const MyComponent = createForwardRefComponent<"button", { variant: string }>(
  ({ variant, as: Comp = "button", asChild, ...props }, ref) => {
    const Component = asChild ? Slot : Comp;
    return <Component ref={ref} data-variant={variant} {...props} />;
  },
);
```

## Best Practices

### Naming Conventions

**✅ Component Naming:**

```tsx
// Root component: [ComponentName]Root or just [ComponentName]
function FeatureCardRoot() {}
function FeatureCard() {} // Alternative

// Sub-components: [ComponentName][SubComponent]
function FeatureCardHeader() {}
function FeatureCardTitle() {}
function FeatureCardAction() {}

// Context and hooks: use[ComponentName]
function useFeatureCard() {}
const FeatureCardContext = React.createContext(null);
```

**✅ File Structure:**

```
components/
  feature-card/
    feature-card.tsx          # Main component file
    feature-card.test.tsx     # Tests
    feature-card.stories.tsx  # Storybook stories
    index.ts                  # Re-exports
```

**✅ Data Attributes:**

```tsx
// Use consistent data-slot attributes
<div data-slot="feature-card">
  <header data-slot="feature-card-header">
    <h3 data-slot="feature-card-title">
```

### Error Handling

```tsx
// Comprehensive error boundaries for compound components
function ComponentErrorBoundary({
  children,
  componentName,
}: {
  children: React.ReactNode;
  componentName: string;
}) {
  return (
    <ErrorBoundary
      fallback={({ error }) => (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Error in {componentName}: {error.message}
          </p>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

// Context validation with helpful error messages
function useFeatureCard() {
  const context = React.useContext(FeatureCardContext);

  if (!context) {
    throw new Error(
      "FeatureCard compound components must be used within <FeatureCard>. " +
        "Make sure you've wrapped your components in the root component.",
    );
  }

  return context;
}
```

### Testing Patterns

```tsx
// Testing compound components
describe("FeatureCard", () => {
  it("should render all sub-components correctly", () => {
    render(
      <FeatureCard variant="premium" data-testid="feature-card">
        <FeatureCardHeader>
          <FeatureCardIcon>🚀</FeatureCardIcon>
          <FeatureCardTitle>Premium Feature</FeatureCardTitle>
        </FeatureCardHeader>
        <FeatureCardContent>
          <FeatureCardDescription>Description text</FeatureCardDescription>
        </FeatureCardContent>
        <FeatureCardFooter>
          <FeatureCardAction data-testid="primary-action">
            Primary Action
          </FeatureCardAction>
        </FeatureCardFooter>
      </FeatureCard>,
    );

    expect(screen.getByTestId("feature-card")).toHaveAttribute(
      "data-slot",
      "feature-card",
    );
    expect(screen.getByText("Premium Feature")).toBeInTheDocument();
    expect(screen.getByText("Description text")).toBeInTheDocument();
    expect(screen.getByTestId("primary-action")).toBeInTheDocument();
  });

  it("should pass context values correctly", () => {
    const onAction = vi.fn();

    render(
      <FeatureCard variant="premium" onAction={onAction}>
        <FeatureCardAction>Click me</FeatureCardAction>
      </FeatureCard>,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("should throw error when used outside context", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<FeatureCardTitle>Isolated Title</FeatureCardTitle>);
    }).toThrow("FeatureCard compound components must be used within");

    consoleSpy.mockRestore();
  });
});
```

### Performance Optimization

```tsx
// Memoize context values to prevent unnecessary re-renders
function FeatureCardRoot(props) {
  const contextValue = React.useMemo(
    () => ({
      variant: props.variant,
      size: props.size,
      isDisabled: props.disabled,
      isLoading: props.loading,
      onAction: props.onAction,
      // ... other context values
    }),
    [props.variant, props.size, props.disabled, props.loading, props.onAction],
  );

  return (
    <FeatureCardContext.Provider value={contextValue}>
      {/* component content */}
    </FeatureCardContext.Provider>
  );
}

// Memoize expensive sub-components
const FeatureCardIcon = React.memo(function FeatureCardIcon({
  className,
  ...props
}) {
  const { variant, showIcon } = useFeatureCard();
  // ... component implementation
});
```

### Documentation Standards

````tsx
/**
 * FeatureCard - A compound component for displaying feature information
 *
 * @example
 * ```tsx
 * <FeatureCard variant="premium" onAction={() => {}}>
 *   <FeatureCardHeader>
 *     <FeatureCardIcon>🚀</FeatureCardIcon>
 *     <FeatureCardTitle>Premium Feature</FeatureCardTitle>
 *   </FeatureCardHeader>
 *   <FeatureCardContent>
 *     <FeatureCardDescription>Feature description</FeatureCardDescription>
 *   </FeatureCardContent>
 *   <FeatureCardFooter>
 *     <FeatureCardAction>Upgrade</FeatureCardAction>
 *   </FeatureCardFooter>
 * </FeatureCard>
 * ```
 */
export interface FeatureCardProps {
  /** Visual variant of the card */
  variant?: "basic" | "premium" | "enterprise";
  /** Size variant affecting spacing and typography */
  size?: "default" | "compact" | "large";
  /** Whether the card is disabled */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Primary action handler */
  onAction?: () => void;
  /** Secondary action handler */
  onSecondaryAction?: () => void;
  /** Whether to show the badge */
  showBadge?: boolean;
  /** Whether to show the icon */
  showIcon?: boolean;
}
````

## Component Templates

### Basic Compound Component Template

```tsx
// component-template.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/renderer/lib/utils";

// 1. Define Context Interface
interface ComponentContextValue {
  // Add your context properties here
  variant: "default" | "secondary";
  size: "sm" | "md" | "lg";
  disabled: boolean;
}

// 2. Create Context and Hook
const ComponentContext = React.createContext<ComponentContextValue | null>(
  null,
);

function useComponent() {
  const context = React.useContext(ComponentContext);
  if (!context) {
    throw new Error("Component parts must be used within <Component>");
  }
  return context;
}

// 3. Define Variants
const componentVariants = cva("base-classes-here", {
  variants: {
    variant: {
      default: "default-variant-classes",
      secondary: "secondary-variant-classes",
    },
    size: {
      sm: "small-size-classes",
      md: "medium-size-classes",
      lg: "large-size-classes",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

// 4. Root Component
interface ComponentProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof componentVariants> {
  disabled?: boolean;
}

function ComponentRoot({
  children,
  className,
  variant = "default",
  size = "md",
  disabled = false,
  ...props
}: ComponentProps) {
  const contextValue: ComponentContextValue = {
    variant,
    size,
    disabled,
  };

  return (
    <ComponentContext.Provider value={contextValue}>
      <div
        data-slot="component"
        className={cn(componentVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </div>
    </ComponentContext.Provider>
  );
}

// 5. Sub-Components
function ComponentHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="component-header"
      className={cn("component-header-classes", className)}
      {...props}
    />
  );
}

function ComponentContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="component-content"
      className={cn("component-content-classes", className)}
      {...props}
    />
  );
}

// 6. Export Structure
export { Component, ComponentHeader, ComponentContent, type ComponentProps };

// Alternative: Export root component as ComponentRoot for clarity
export { ComponentRoot as Component };
```

---

## 🔗 Related Documentation

### **📖 Essential Reading**

- **[Design System Overview](./design-system-overview.md)** - Overall design system architecture **(15 min)**
- **[Design Tokens](./design-tokens.md)** - Color, spacing, and typography tokens **(10 min)**
- **[Code Simplicity Principles](../developer/code-simplicity-principles.md)** - INLINE-FIRST philosophy **(10 min)**

### **🏗️ Implementation Context**

- **[Coding Standards](../developer/coding-standards.md)** - React and TypeScript patterns **(10 min)**
- **[Data Loading Patterns](../developer/data-loading-patterns.md)** - How components integrate with data **(15 min)**
- **[Folder Structure](../developer/folder-structure.md)** - Where to place compound components **(5 min)**

### **🎨 Design Integration**

- **[Visual Design Principles](./visual-design-principles.md)** - How compound components support visual consistency
- **[Technical Guides](../technical-guides/frontend/)** - Advanced frontend patterns and performance

### **🔙 Navigation**

- **[← Back to Design Documentation](./README.md)**
- **[↑ Main Documentation](../README.md)**
- **[🔍 Search & Glossary](../glossary-and-search.md)** - Find specific patterns and concepts

### **🎯 Next Steps**

1. **Practice**: Start with the [Simple StatusIndicator example](#example-1-simple-statusindicator)
2. **Implement**: Create a compound component using the [Basic Template](#basic-compound-component-template)
3. **Integrate**: Follow [Coding Standards](../developer/coding-standards.md) for proper implementation
4. **Document**: Use the [Documentation Standards](#documentation-standards) for your components

**💡 Remember**: Compound Components excel at providing flexible composition while maintaining design consistency. Use them when you need multiple related components that share state and behavior.
