# Design System Overview

This document provides a high-level overview of the Project Wiz Design System architecture and its role in creating consistent, accessible interfaces.

## 🎯 System Purpose

The Project Wiz Design System serves as the foundation for building consistent AI-powered development tools:

- **Accelerate Development**: Pre-built, tested patterns that reduce implementation time
- **Ensure Consistency**: Unified visual language across all features
- **Maintain Quality**: Built-in accessibility and usability standards
- **Scale Efficiently**: Modular architecture that grows with the platform

## 🏗️ Architecture Overview

### **Foundation Layer**

Core building blocks that define the visual language:

- **[Visual Design Principles](./visual-design-principles.md)** - Core design philosophy
- **[Design Tokens](./design-tokens.md)** - Colors, typography, spacing, and other foundational values
- **Accessibility Standards** - WCAG 2.1 AA compliance requirements

### **Component Layer**

Reusable interface patterns:

- **[Compound Components Guide](./compound-components-guide.md)** - Flexible component creation patterns
- **shadcn/ui Integration** - Base component library
- **Type Safety** - TypeScript-first approach

### **Implementation Layer**

Technical standards for consistent implementation:

- **[Coding Standards](../developer/coding-standards.md)** - React and TypeScript patterns
- **[Code Simplicity Principles](../developer/code-simplicity-principles.md)** - INLINE-FIRST philosophy
- **[Data Loading Patterns](../developer/data-loading-patterns.md)** - Component data integration

## 🎨 Key Design Decisions

### **Color System**

- **OKLCH Color Space**: Perceptually uniform colors for consistent appearance
- **Semantic Tokens**: Colors that communicate meaning (primary, destructive, etc.)
- **Theme Support**: Automatic light/dark theme adaptation

### **Typography**

- **System Fonts**: Performance-optimized native font stacks
- **Consistent Scale**: 12px to 30px with mathematical ratios
- **Developer-Focused**: Optimized for code readability and extended use

### **Spacing**

- **8px Grid System**: Consistent rhythm for all spatial decisions
- **Semantic Tokens**: Meaningful spacing names (component-padding-md)
- **Responsive**: Mobile-first approach with clear breakpoints

### **Components**

- **Compound Components**: Flexible composition while maintaining consistency
- **Accessibility First**: WCAG 2.1 AA compliance built-in
- **Type Safety**: Full TypeScript support with prop validation

## 🛠️ Development Integration

### **Technology Stack**

- **React 19**: Function declarations (not React.FC)
- **TypeScript**: Strict mode with full type inference
- **shadcn/ui**: Base component library
- **Tailwind CSS 4**: Utility-first styling with design tokens
- **Class Variance Authority**: Type-safe component variants

### **Quality Standards**

- **Accessibility**: Automated testing with axe-core
- **Performance**: Lighthouse audits and bundle size monitoring
- **Consistency**: ESLint rules enforce design system patterns
- **Testing**: Comprehensive test coverage for all components

## 📋 Implementation Checklist

When creating or updating components, ensure:

- [ ] Uses design tokens (no hardcoded values)
- [ ] Works in both light and dark themes
- [ ] Follows 8px spacing grid
- [ ] Meets WCAG 2.1 AA standards
- [ ] Uses compound component pattern when appropriate
- [ ] Includes proper TypeScript types
- [ ] Has comprehensive tests
- [ ] Documentation includes usage examples

## 🔗 Navigation

### **Start Here**

1. **[Design System README](./README.md)** - Main documentation hub
2. **[Visual Design Principles](./visual-design-principles.md)** - Core design philosophy
3. **[Design Tokens](./design-tokens.md)** - Implementation details

### **Create Components**

1. **[Compound Components Guide](./compound-components-guide.md)** - Component patterns
2. **[Coding Standards](../developer/coding-standards.md)** - Technical implementation
3. **[Data Loading Patterns](../developer/data-loading-patterns.md)** - Data integration

### **Development Context**

- **[Code Simplicity Principles](../developer/code-simplicity-principles.md)** - INLINE-FIRST philosophy
- **[IPC Communication](../developer/ipc-communication-patterns.md)** - Electron patterns
- **[Database Patterns](../developer/database-patterns.md)** - Backend integration

---

**💡 Remember**: This design system focuses specifically on visual standards and component patterns. It works in harmony with the development patterns documented in the `docs/developer/` directory to create a cohesive development experience.
