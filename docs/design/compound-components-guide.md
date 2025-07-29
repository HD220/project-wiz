# Compound Components Guide

Real-world compound component patterns implemented in Project Wiz. This guide showcases production-ready patterns from the codebase, including ProfileAvatar, AgentCard, and SearchFilterBar implementations.

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

**1. Flexible Composition Structure Exemple**

```tsx
// ✅ Flexible: Components can be composed in different ways
<[ComponentName] variant="premium">
  <[ComponentName]Header>
    <[ComponentName]Icon />
    <[ComponentName]Title>Advanced AI</[ComponentName]Title>
  </[ComponentName]Header>
  <[ComponentName]Content>
    <[ComponentName]Description>...</[ComponentName]Description>
    <[ComponentName]Badge>New</[ComponentName]Badge>
  </[ComponentName]Content>
  <[ComponentName]Footer>
    <[ComponentName]Action>Upgrade</[ComponentName]Action>
  </[ComponentName]Footer>
</[ComponentName]>

// ✅ Different composition for different contexts
<[ComponentName] variant="basic">
  <[ComponentName]Header>
    <[ComponentName]Title>Basic Features</[ComponentName]Title>
  </[ComponentName]Header>
  <[ComponentName]Content>
    <[ComponentName]Description>...</[ComponentName]Description>
  </[ComponentName]Content>
</[ComponentName]>
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
type [ComponentName]ContextData = {
  variant: "basic" | "premium" | "enterprise";
  isDisabled: boolean;
  onAction?: () => void;
}

const [ComponentName]Context = React.createContext<[ComponentName]ContextData | null>(
  null,
);

// Hook for accessing context
function use[ComponentName]Context() {
  const context = React.useContext([ComponentName]Context);
  if (!context) {
    throw new Error("[ComponentName] components must be used within <[ComponentName]>");
  }
  return context;
}
```

### Component Hierarchy Structure

```tsx
// Root component provides context when necessary
export type [ComponentName]Props = {...}
function [ComponentName]({ children, variant, onAction, disabled }:[ComponentName]Props) {

  return (
    <[ComponentName]Context.Provider value={{
    variant,
    isDisabled: disabled,
    onAction,
  }}>
      <div className={cardVariants({ variant })}>{children}</div>
    </[ComponentName]Context.Provider>
  );
}

```

### Export Patterns

- Export on definition : `export function Component...`, `export type TypeName...`

## Implementation Patterns

- use React.ComponentProps when necessary
- use type for props, not interface

### Documentation Standards

````tsx
/**
 * [ComponentName] - A compound component for displaying feature information
 *
 * @example
 * ```tsx
 * <[ComponentName] variant="premium" >
 *   <[ComponentName]Header>
 *     <[ComponentName]Icon>🚀</[ComponentName]Icon>
 *     <[ComponentName]Title>Premium Feature</[ComponentName]Title>
 *   </[ComponentName]Header>
 *   <[ComponentName]Content>
 *     <[ComponentName]Description>Feature description</[ComponentName]Description>
 *   </[ComponentName]Content>
 *   <[ComponentName]Footer>
 *     <[ComponentName]Action onAction={() => {}}>Upgrade</[ComponentName]Action>
 *   </[ComponentName]Footer>
 * </[ComponentName]>
 * ```
 */
````

## Component Templates

### Basic Compound Component Template Exemple

```tsx
// component-template.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/renderer/lib/utils";

// 1. Define Context Interface
exort type ComponentContextData = {
  // Add your context properties here
  variant: "default" | "secondary";
  size: "sm" | "md" | "lg";
  disabled: boolean;
}

// 2. Create Context and Hook
export const ComponentContext = React.createContext<ComponentContextData | null>(
  null,
);

export function useComponentContext() {
  const context = React.useContext(ComponentContext);
  if (!context) {
    throw new Error("Component parts must be used within <Component>");
  }
  return context;
}

// 3. Define Variants
export const componentVariants = cva("base-classes-here", {
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
export type ComponentNameProps = React.ComponentProps<"div"> && VariantProps<typeof componentVariants> & {
  disabled?: boolean;
}

export function ComponentName({
  children,
  className,
  variant = "default",
  size = "md",
  disabled = false,
  ...props
}: ComponentNameProps) {


  return (
    <ComponentContext.Provider value={{
    variant,
    size,
    disabled,
  }}>
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
export function ComponentNameHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="component-header"
      className={cn("component-header-classes", className)}
      {...props}
    />
  );
}

exrpot function ComponentNameContent({
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

```

---

## 🔗 Related Documentation

### **📖 Essential Reading**

- **[Design System Overview](./README.md)** - Complete design system documentation **(15 min)**
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
