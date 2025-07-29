# Design Tokens

Production-ready CSS custom properties powering the Project Wiz design system. All tokens are implemented in `src/renderer/globals.css` and automatically support light/dark themes with OKLCH color space.

## 📋 Overview

Design tokens are the single source of truth for all visual properties in Project Wiz. They provide OKLCH-based colors, semantic spacing, typography scales, and component-specific tokens that power all 48 shadcn/ui components plus custom extensions.

## 🎨 Color System (Production Implementation)

### **OKLCH Color Space Benefits**

- **Perceptual Uniformity**: Better color consistency across different displays
- **Wide Gamut Support**: Future-proof for modern displays
- **Predictable Gradients**: Smooth color transitions in dark/light themes
- **Better Accessibility**: More predictable contrast calculations

### **Core Color Tokens** (from `globals.css`)

```css
:root {
  /* Base radius for all components */
  --radius: 0.25rem;

  /* Light theme colors */
  --background: oklch(1 0 0); /* Pure white */
  --foreground: oklch(0.141 0.005 285.823); /* Dark text */
  --card: oklch(1 0 0); /* Card backgrounds */
  --card-foreground: oklch(0.141 0.005 285.823); /* Text on cards */
  --popover: oklch(1 0 0); /* Popover backgrounds */
  --popover-foreground: oklch(0.141 0.005 285.823); /* Popover text */

  /* Brand colors */
  --primary: oklch(0.21 0.006 285.885); /* Professional blue */
  --primary-foreground: oklch(0.985 0 0); /* White text on primary */
  --secondary: oklch(0.967 0.001 286.375); /* Light gray */
  --secondary-foreground: oklch(
    0.21 0.006 285.885
  ); /* Blue text on secondary */

  /* Functional colors */
  --muted: oklch(0.967 0.001 286.375); /* Subtle backgrounds */
  --muted-foreground: oklch(0.552 0.016 285.938); /* Secondary text */
  --accent: oklch(0.967 0.001 286.375); /* Highlight backgrounds */
  --accent-foreground: oklch(0.21 0.006 285.885); /* Text on highlights */

  /* State colors */
  --destructive: oklch(0.577 0.245 27.325); /* Red for errors/delete */

  /* Interface elements */
  --border: oklch(0.92 0.004 286.32); /* Subtle borders */
  --input: oklch(0.92 0.004 286.32); /* Input field borders */
  --ring: oklch(0.705 0.015 286.067); /* Focus rings */
}
```

### **Discord-Like Sidebar Colors**

```css
:root {
  /* Sidebar system for Discord-like navigation */
  --sidebar: oklch(0.985 0 0); /* Sidebar background */
  --sidebar-foreground: oklch(0.141 0.005 285.823); /* Sidebar text */
  --sidebar-primary: oklch(0.21 0.006 285.885); /* Active sidebar items */
  --sidebar-primary-foreground: oklch(0.985 0 0); /* Text on active items */
  --sidebar-accent: oklch(0.967 0.001 286.375); /* Hover states */
  --sidebar-accent-foreground: oklch(0.21 0.006 285.885); /* Hover text */
  --sidebar-border: oklch(0.92 0.004 286.32); /* Sidebar borders */
  --sidebar-ring: oklch(0.705 0.015 286.067); /* Focus rings in sidebar */
}
```

### **Chart Colors** (Data Visualization)

```css
:root {
  /* Chart color palette for data visualization */
  --chart-1: oklch(0.646 0.222 41.116); /* Orange */
  --chart-2: oklch(0.6 0.118 184.704); /* Teal */
  --chart-3: oklch(0.398 0.07 227.392); /* Blue */
  --chart-4: oklch(0.828 0.189 84.429); /* Yellow */
  --chart-5: oklch(0.769 0.188 70.08); /* Green */
}
```

### **Dark Theme Colors**

```css
.dark {
  /* Inverted theme for dark mode */
  --background: oklch(0.141 0.005 285.823); /* Dark background */
  --foreground: oklch(0.985 0 0); /* Light text */
  --card: oklch(0.21 0.006 285.885); /* Dark cards */
  --card-foreground: oklch(0.985 0 0); /* Light text on cards */
  --popover: oklch(0.21 0.006 285.885); /* Dark popovers */
  --popover-foreground: oklch(0.985 0 0); /* Light popover text */

  /* Adjusted brand colors for dark theme */
  --primary: oklch(0.92 0.004 286.32); /* Light blue */
  --primary-foreground: oklch(0.21 0.006 285.885); /* Dark text on primary */
  --secondary: oklch(0.274 0.006 286.033); /* Dark gray */
  --secondary-foreground: oklch(0.985 0 0); /* Light text on secondary */

  /* Dark theme functional colors */
  --muted: oklch(0.274 0.006 286.033); /* Dark muted */
  --muted-foreground: oklch(0.705 0.015 286.067); /* Medium gray text */
  --accent: oklch(0.274 0.006 286.033); /* Dark accent */
  --accent-foreground: oklch(0.985 0 0); /* Light accent text */

  /* Dark theme destructive */
  --destructive: oklch(0.704 0.191 22.216); /* Brighter red for dark */

  /* Dark theme interface */
  --border: oklch(1 0 0 / 10%); /* Subtle light borders */
  --input: oklch(1 0 0 / 15%); /* Input field borders */
  --ring: oklch(0.552 0.016 285.938); /* Focus rings */

  /* Dark theme sidebar colors */
  --sidebar: oklch(0.21 0.006 285.885); /* Dark sidebar */
  --sidebar-foreground: oklch(0.985 0 0); /* Light sidebar text */
  --sidebar-primary: oklch(0.488 0.243 264.376); /* Purple active items */
  --sidebar-primary-foreground: oklch(0.985 0 0); /* Light text on active */
  --sidebar-accent: oklch(0.274 0.006 286.033); /* Dark hover states */
  --sidebar-accent-foreground: oklch(0.985 0 0); /* Light hover text */
  --sidebar-border: oklch(1 0 0 / 10%); /* Subtle borders */
  --sidebar-ring: oklch(0.552 0.016 285.938); /* Focus rings */

  /* Dark theme chart colors */
  --chart-1: oklch(0.488 0.243 264.376); /* Purple */
  --chart-2: oklch(0.696 0.17 162.48); /* Green */
  --chart-3: oklch(0.769 0.188 70.08); /* Yellow */
  --chart-4: oklch(0.627 0.265 303.9); /* Pink */
  --chart-5: oklch(0.645 0.246 16.439); /* Orange */
}
```

## 🔤 Typography System (Production Tokens)

### **Font Size Scale**

```css
:root {
  /* Typography tokens from globals.css */
  --font-size-xs: 0.75rem; /* 12px - Small text, captions */
  --font-size-sm: 0.875rem; /* 14px - Body text secondary */
  --font-size-base: 1rem; /* 16px - Primary body text */
  --font-size-lg: 1.125rem; /* 18px - Large body text */
  --font-size-xl: 1.25rem; /* 20px - Headings */
  --font-size-2xl: 1.5rem; /* 24px - Section headers */
  --font-size-3xl: 1.875rem; /* 30px - Page titles */
}
```

### **Line Height Scale**

```css
:root {
  /* Line height tokens for optimal readability */
  --line-height-tight: 1.25; /* Headings and tight text */
  --line-height-normal: 1.5; /* Body text default */
  --line-height-relaxed: 1.75; /* Long-form content */
}
```

### **Font Weight Scale**

```css
:root {
  /* Font weight tokens */
  --font-weight-normal: 400; /* Regular text */
  --font-weight-medium: 500; /* Emphasized text */
  --font-weight-semibold: 600; /* Headings */
  --font-weight-bold: 700; /* Strong emphasis */
}
```

## 📏 Spacing System (8px Grid)

### **Component Spacing** (Internal padding/margins)

```css
:root {
  /* Component spacing - for internal padding and margins */
  --spacing-component-xs: 0.25rem; /* 4px */
  --spacing-component-sm: 0.5rem; /* 8px */
  --spacing-component-md: 1rem; /* 16px */
  --spacing-component-lg: 1.5rem; /* 24px */
  --spacing-component-xl: 2rem; /* 32px */
  --spacing-component-2xl: 2.5rem; /* 40px */
}
```

### **Layout Spacing** (Between sections and components)

```css
:root {
  /* Layout spacing - for spacing between sections */
  --spacing-layout-xs: 0.5rem; /* 8px */
  --spacing-layout-sm: 1rem; /* 16px */
  --spacing-layout-md: 1.5rem; /* 24px */
  --spacing-layout-lg: 2rem; /* 32px */
  --spacing-layout-xl: 3rem; /* 48px */
  --spacing-layout-2xl: 4rem; /* 64px */
}
```

### **Component-Specific Spacing**

```css
:root {
  /* Semantic spacing for specific components */
  --feature-card-padding: var(--spacing-component-lg);
  --feature-card-gap: var(--spacing-component-md);
  --feature-card-border-radius: var(--radius-lg);

  --status-indicator-size-sm: 0.375rem; /* 6px */
  --status-indicator-size-md: 0.5rem; /* 8px */
  --status-indicator-size-lg: 0.625rem; /* 10px */

  --data-display-padding: var(--spacing-component-lg);
  --data-display-gap: var(--spacing-component-sm);
}
```

## 🎨 Border and Effects

### **Border Radius System**

```css
:root {
  /* Base radius */
  --radius: 0.25rem; /* 4px base radius */
}

/* Calculated radius variants in Tailwind theme */
@theme inline {
  --radius-sm: calc(var(--radius) - 4px); /* 0px */
  --radius-md: calc(var(--radius) - 2px); /* 2px */
  --radius-lg: var(--radius); /* 4px */
  --radius-xl: calc(var(--radius) + 4px); /* 8px */
}
```

### **Animation Tokens**

```css
@theme inline {
  /* Animation utilities */
  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up: accordion-up 0.2s ease-out;
}
```

### **Custom Animations** (from `globals.css`)

```css
/* Status pulse animation */
@keyframes status-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

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

/* Auth form slide up */
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

## 🔧 Usage Patterns

### **Component Development**

```tsx
// CORRECT: Use design tokens
export function ComponentName({ className, ...props }: ComponentProps) {
  return (
    <div
      className={cn(
        "px-[var(--spacing-component-md)] py-[var(--spacing-component-sm)]",
        "bg-card text-card-foreground border border-border",
        "rounded-[var(--radius)] transition-all duration-200",
        className,
      )}
      {...props}
    />
  );
}

// INCORRECT: Hardcoded values
export function ComponentName({ className, ...props }: ComponentProps) {
  return (
    <div
      className={cn(
        "px-4 py-2 bg-white text-black border border-gray-200",
        "rounded transition-all duration-200",
        className,
      )}
      {...props}
    />
  );
}
```

### **Responsive Usage**

```tsx
// Responsive spacing with tokens
className={cn(
  "px-[var(--spacing-component-sm)] lg:px-[var(--spacing-component-lg)]",
  "py-[var(--spacing-component-xs)] lg:py-[var(--spacing-component-sm)]"
)}
```

### **Theme Integration**

```tsx
// Components automatically adapt to theme
<Card className="bg-card text-card-foreground border-border">
  <CardHeader className="border-b border-border">
    <CardTitle className="text-card-foreground">Title</CardTitle>
  </CardHeader>
  <CardContent className="text-muted-foreground">
    Content adapts to both light and dark themes
  </CardContent>
</Card>
```

---

## 🔗 Related Documentation

### **Implementation Guides**

- **[Component Design Guidelines](./component-design-guidelines.md)** - How to use design tokens in components
- **[Design System README](./README.md)** - Complete design system overview
- **[Visual Design Principles](./visual-design-principles.md)** - Design philosophy and patterns

### **Visual Standards**

- **[Color Palette Specification](./color-palette-specification.md)** - Detailed color usage guidelines
- **[Typography System](./typography-system.md)** - Complete typography implementation
- **[Layout and Spacing](./layout-and-spacing.md)** - Grid system and spacing patterns

### **Development Integration**

- **[Coding Standards](../developer/coding-standards.md)** - React and TypeScript patterns
- **[Code Simplicity Principles](../developer/code-simplicity-principles.md)** - INLINE-FIRST philosophy

---

**🎯 Production Reality**: All tokens documented here are implemented and in active use. The design system is fully functional with 48 shadcn/ui components, complete dark/light theme support, and WCAG 2.1 AA accessibility compliance. Use these tokens as your single source of truth for styling in Project Wiz.
