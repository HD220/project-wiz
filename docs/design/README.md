# Project Wiz Design System

A focused design system for building consistent, accessible interfaces in the Project Wiz AI-powered development platform.

## 📋 Overview

The Project Wiz Design System provides essential visual standards and component patterns to ensure consistency across the application. It focuses on:

- **Visual Design Standards** - Colors, typography, spacing, and visual principles
- **Component Patterns** - How to create components using Compound Components pattern
- **Design Tokens** - The fundamental building blocks for consistent styling

## 🎨 Core Design Principles

1. **Developer-Centric Clarity** - Optimize for developers who spend hours daily in the interface
2. **AI-Assisted Intelligence** - Convey sophistication while maintaining approachability
3. **Discord-Inspired Familiarity** - Leverage familiar interaction patterns for immediate usability
4. **Consistent Predictability** - Every interaction should feel predictable and learnable
5. **Accessible by Design** - WCAG 2.1 AA compliance mandatory
6. **Performance-Conscious Beauty** - Visual appeal never compromises performance

## 📚 Documentation Structure

### **🎨 Visual Design**

- **[Visual Design Principles](./visual-design-principles.md)** - Core design philosophy and visual guidelines **(15 min)**
- **[Design Tokens](./design-tokens.md)** - Colors, typography, spacing, and other foundational tokens **(10 min)**

### **🧩 Component Architecture**

- **[Compound Components Guide](./compound-components-guide.md)** - How to create flexible, reusable components **(20 min)**

### **📋 System Overview**

- **[Design System Overview](./design-system-overview.md)** - High-level architecture and integration guide **(15 min)**

## 🚀 Quick Start

### For Designers

1. Start with [Visual Design Principles](./visual-design-principles.md) to understand the design philosophy
2. Review [Design Tokens](./design-tokens.md) for available colors, spacing, and typography
3. Use the established patterns when creating new designs

### For Developers

1. Read [Design Tokens](./design-tokens.md) to understand available CSS custom properties
2. Study [Compound Components Guide](./compound-components-guide.md) for component creation patterns
3. Follow the established patterns when implementing components

## 🎨 Design Tokens Summary

### **Colors (OKLCH-based)**

- Primary: Professional blue for main actions
- Secondary: Neutral gray for supporting elements
- Semantic: Success, warning, error, info colors
- Surface: Background, card, and elevation colors

### **Typography**

- Font Stack: System fonts for performance
- Scale: 12px to 60px with consistent ratios
- Weights: Normal (400) to Bold (700)
- Line Heights: Optimized for readability

### **Spacing**

- 8px Grid System: Consistent rhythm
- Semantic Tokens: Component and layout spacing
- Responsive: Mobile-first approach

### **Other Tokens**

- Border Radius: 4px base with calculated variants
- Shadows: 5-level elevation system
- Animations: Consistent durations and easing

## 🧩 Component Patterns

### **Compound Components**

The preferred pattern for creating flexible, reusable components:

```tsx
<FeatureCard variant="premium">
  <FeatureCardHeader>
    <FeatureCardIcon />
    <FeatureCardTitle>Premium Feature</FeatureCardTitle>
  </FeatureCardHeader>
  <FeatureCardContent>
    <FeatureCardDescription>Description text</FeatureCardDescription>
  </FeatureCardContent>
  <FeatureCardFooter>
    <FeatureCardAction>Upgrade</FeatureCardAction>
  </FeatureCardFooter>
</FeatureCard>
```

**Benefits:**

- Flexible composition while maintaining consistency
- Type-safe props and context sharing
- Clear component hierarchy
- Easier maintenance and updates

## ♿ Accessibility Standards

All components must meet **WCAG 2.1 AA** standards:

- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Focus Management**: Visible focus indicators on all focusable elements

## 🔧 Implementation Guidelines

### **Required Patterns**

- Use CSS custom properties (design tokens) instead of hardcoded values
- Follow the 8px grid system for spacing
- Implement proper dark/light theme support
- Apply consistent animation and transition patterns

### **File Organization**

```
components/
  feature-name/
    feature-name.tsx          # Main component file
    feature-name.test.tsx     # Tests
    index.ts                  # Re-exports
```

### **Naming Conventions**

- Files: `kebab-case` (feature-card.tsx)
- Components: `PascalCase` function declarations
- Props: Destructured in parameters
- Exports: Named exports only

## 🔗 Related Documentation

### **Development Context**

- **[Coding Standards](../developer/coding-standards.md)** - React and TypeScript patterns
- **[Code Simplicity Principles](../developer/code-simplicity-principles.md)** - INLINE-FIRST philosophy
- **[Data Loading Patterns](../developer/data-loading-patterns.md)** - How components integrate with data

### **Architecture**

- **[Folder Structure](../developer/folder-structure.md)** - Project organization
- **[IPC Communication](../developer/ipc-communication-patterns.md)** - Electron patterns

## 📋 Design System Checklist

When creating or updating components, ensure:

- [ ] Uses only design tokens (no hardcoded values)
- [ ] Works correctly in both light and dark themes
- [ ] Follows the 8px spacing system
- [ ] Meets WCAG 2.1 AA accessibility standards
- [ ] Uses compound component pattern when appropriate
- [ ] Includes proper TypeScript interfaces
- [ ] Has comprehensive tests
- [ ] Documentation includes usage examples

## 🎯 Next Steps

1. **Read First**: [Visual Design Principles](./visual-design-principles.md) for overall design philosophy
2. **Implement**: [Design Tokens](./design-tokens.md) for consistent styling
3. **Create**: [Compound Components Guide](./compound-components-guide.md) for flexible components
4. **Apply**: Development documentation for technical implementation

---

**💡 Remember**: This design system focuses specifically on visual standards and component patterns. For technical implementation details, refer to the developer documentation in the `docs/developer/` directory.
