# Design System Specification

This document defines the complete visual design system for Project Wiz, establishing a modern, professional, and cohesive visual language for the AI-powered development platform.

## 🎨 Design Philosophy

### Core Visual Principles

**Modern AI Professional**

- Clean, sophisticated aesthetics that convey technical expertise
- Subtle AI-themed visual cues without being overwhelming
- Professional appearance suitable for enterprise environments
- Approachable and user-friendly interface design

**Discord-Inspired Familiarity**

- Leverages familiar patterns from Discord for intuitive navigation
- Enhanced with professional polish and enterprise-ready aesthetics
- Maintains cognitive familiarity while elevating visual sophistication

**Visual Hierarchy & Information Architecture**

- Clear content hierarchy with purposeful typography scaling
- Strategic use of color and contrast to guide user attention
- Consistent spacing and layout patterns for predictable interfaces
- Visual grouping and categorization of related functionality

## 🎯 Design Goals

### Primary Objectives

1. **Professional Trust** - Establish credibility through polished, consistent design
2. **Cognitive Ease** - Reduce mental load through familiar patterns and clear hierarchy
3. **Visual Impact** - Create memorable, distinctive interfaces that users enjoy
4. **Accessibility** - Ensure inclusive design meeting WCAG 2.1 AA standards
5. **Scalability** - Design system that grows with product complexity

### Success Metrics

- **Reduced Time to Value** - Users accomplish tasks faster with clearer interfaces
- **Increased Engagement** - Users spend more time productively in the application
- **Lower Support Volume** - Intuitive design reduces confusion and support requests
- **Brand Recognition** - Distinctive visual identity that users associate with quality

## 🌈 Existing Color System

### Current Design Tokens

**Working with Established Tokens**

- Leverage existing OKLCH color space tokens
- Create semantic usage patterns without new token creation
- Enhance visual impact through strategic application of current colors
- Maintain consistency across light and dark themes

### Primary Brand & Interactive Colors

**Current Brand Identity** (using existing tokens)

```css
/* Primary brand colors from existing tokens */
--primary: oklch(0.21 0.006 285.885); /* Dark Purple (light mode) */
--primary: oklch(0.92 0.004 286.32); /* Light Gray (dark mode) */
--sidebar-primary: oklch(0.488 0.243 264.376); /* Purple accent (dark mode) */
```

**Status & Semantic Colors** (using existing chart colors)

```css
/* Success States - using chart-5 */
--chart-5: oklch(0.769 0.188 70.08); /* Green - Success/Active */

/* Warning States - using chart-4 */
--chart-4: oklch(0.828 0.189 84.429); /* Yellow - Warning/Busy */

/* Error States - using destructive */
--destructive: oklch(0.577 0.245 27.325); /* Red - Error (light mode) */
--destructive: oklch(0.704 0.191 22.216); /* Red - Error (dark mode) */

/* Info States - using chart-2 */
--chart-2: oklch(0.6 0.118 184.704); /* Blue - Info/Idle */

/* Additional chart colors for variety */
--chart-1: oklch(0.646 0.222 41.116); /* Orange variant */
--chart-3: oklch(0.398 0.07 227.392); /* Dark blue variant */
```

### Surface & Background Hierarchy

**Current Surface Tokens**

```css
/* Background hierarchy using existing tokens */
--background: oklch(1 0 0); /* Page background (light) */
--background: oklch(0.141 0.005 285.823); /* Page background (dark) */

--card: oklch(1 0 0); /* Card background (light) */
--card: oklch(0.21 0.006 285.885); /* Card background (dark) */

--sidebar: oklch(0.985 0 0); /* Sidebar background (light) */
--sidebar: oklch(0.21 0.006 285.885); /* Sidebar background (dark) */

--secondary: oklch(0.967 0.001 286.375); /* Secondary surface (light) */
--secondary: oklch(0.274 0.006 286.033); /* Secondary surface (dark) */
```

**Text & Content Colors**

```css
/* Text hierarchy using existing tokens */
--foreground: oklch(0.141 0.005 285.823); /* Primary text (light) */
--foreground: oklch(0.985 0 0); /* Primary text (dark) */

--muted-foreground: oklch(0.552 0.016 285.938); /* Secondary text (light) */
--muted-foreground: oklch(0.705 0.015 286.067); /* Secondary text (dark) */
```

### Interactive States & Effects

**Current Interactive Tokens**

```css
/* Border and input states */
--border: oklch(0.92 0.004 286.32); /* Borders (light) */
--border: oklch(1 0 0 / 10%); /* Borders (dark) */

--input: oklch(0.92 0.004 286.32); /* Input borders (light) */
--input: oklch(1 0 0 / 15%); /* Input borders (dark) */

/* Focus and selection */
--ring: oklch(0.705 0.015 286.067); /* Focus rings (light) */
--ring: oklch(0.552 0.016 285.938); /* Focus rings (dark) */
```

## 📝 Typography System

### Current Typography Tokens

**Existing Font Sizes**

```css
/* Current typography tokens from globals.css */
--font-size-xs: 0.75rem; /* 12px - Captions, labels */
--font-size-sm: 0.875rem; /* 14px - Small text, secondary info */
--font-size-base: 1rem; /* 16px - Body text, default */
--font-size-lg: 1.125rem; /* 18px - Large body text */
--font-size-xl: 1.25rem; /* 20px - Small headings */
--font-size-2xl: 1.5rem; /* 24px - Medium headings */
--font-size-3xl: 1.875rem; /* 30px - Large headings */
```

**Existing Line Heights**

```css
/* Current line height tokens from globals.css */
--line-height-tight: 1.25; /* Tight spacing for headings */
--line-height-normal: 1.5; /* Normal spacing for body text */
--line-height-relaxed: 1.75; /* Relaxed spacing for comfortable reading */
```

**Existing Font Weights**

```css
/* Current font weight tokens from globals.css */
--font-weight-normal: 400; /* Regular text */
--font-weight-medium: 500; /* Medium emphasis */
--font-weight-semibold: 600; /* Strong emphasis */
--font-weight-bold: 700; /* Bold headings */
```

### Typography Hierarchy (Using Existing Tokens)

**Heading Scale**

- **H1**: `--font-size-3xl` + `--font-weight-bold` + `--line-height-tight`
- **H2**: `--font-size-2xl` + `--font-weight-semibold` + `--line-height-tight`
- **H3**: `--font-size-xl` + `--font-weight-semibold` + `--line-height-tight`
- **H4**: `--font-size-lg` + `--font-weight-medium` + `--line-height-normal`

**Body Text Scale**

- **Large Body**: `--font-size-lg` + `--font-weight-normal` + `--line-height-relaxed`
- **Default Body**: `--font-size-base` + `--font-weight-normal` + `--line-height-normal`
- **Small Body**: `--font-size-sm` + `--font-weight-normal` + `--line-height-normal`
- **Caption**: `--font-size-xs` + `--font-weight-normal` + `--line-height-normal`

**Interface Elements**

- **Buttons**: `--font-size-sm` + `--font-weight-medium`
- **Labels**: `--font-size-sm` + `--font-weight-medium`
- **Navigation**: `--font-size-sm` + `--font-weight-medium`
- **Badges**: `--font-size-xs` + `--font-weight-medium`

## 📐 Spacing & Layout System

### Current Spacing Tokens

**Existing Component Spacing**

```css
/* Current spacing tokens from globals.css */
--spacing-component-xs: 0.25rem; /* 4px - Minimal spacing */
--spacing-component-sm: 0.5rem; /* 8px - Small elements */
--spacing-component-md: 0.75rem; /* 12px - Medium spacing */
--spacing-component-lg: 1rem; /* 16px - Standard spacing */
--spacing-component-xl: 1.5rem; /* 24px - Large spacing */
--spacing-component-2xl: 2rem; /* 32px - Extra large */
```

**Existing Layout Spacing**

```css
/* Current layout tokens from globals.css */
--spacing-layout-xs: 0.5rem; /* 8px - Tight layouts */
--spacing-layout-sm: 1rem; /* 16px - Compact sections */
--spacing-layout-md: 1.5rem; /* 24px - Standard sections */
--spacing-layout-lg: 2rem; /* 32px - Generous spacing */
--spacing-layout-xl: 3rem; /* 48px - Large sections */
--spacing-layout-2xl: 4rem; /* 64px - Page sections */
```

**Spacing Usage Guidelines**

- **Component Spacing**: Use for internal component padding, gaps, margins
- **Layout Spacing**: Use for section separation, page layout, content areas
- **Consistent Application**: Maintain spacing ratios across all interfaces

### Layout Patterns

**Container Strategies** (using Tailwind defaults)

- Use Tailwind's built-in container classes and max-widths
- Leverage responsive design utilities
- Apply consistent spacing using existing tokens

**Grid Applications**

- Use Tailwind's grid system with existing spacing tokens
- Apply component and layout spacing consistently
- Maintain responsive behavior across breakpoints

## 🎨 Border Radius & Effects

### Current Border Radius System

**Existing Radius Token**

```css
/* Current radius system from globals.css */
--radius: 0.25rem; /* 4px - Base radius */

/* Derived radius values in Tailwind theme */
--radius-sm: calc(var(--radius) - 4px); /* 0px - Minimal rounding */
--radius-md: calc(var(--radius) - 2px); /* 2px - Small rounding */
--radius-lg: var(--radius); /* 4px - Default rounding */
--radius-xl: calc(var(--radius) + 4px); /* 8px - Large rounding */
```

**Radius Applications**

- **Cards**: Use `--radius-lg` for consistent card styling
- **Buttons**: Use `--radius-lg` for standard button appearance
- **Inputs**: Use `--radius-md` for form elements
- **Badges**: Use `--radius-xl` for pill-shaped elements
- **Avatars**: Use `rounded-full` class for circular elements

### Visual Effects

**Elevation & Depth** (using Tailwind shadows)

- Use Tailwind's built-in shadow utilities
- Combine shadows with existing color tokens for brand consistency
- Apply backdrop blur effects for modern overlay styling

**Brand-Colored Shadows** (using existing tokens)

```css
/* Create colored shadows with existing color tokens */
.shadow-primary {
  box-shadow: 0 4px 14px 0 hsl(var(--sidebar-primary) / 0.2);
}

.shadow-success {
  box-shadow: 0 4px 14px 0 hsl(var(--chart-5) / 0.2);
}

.shadow-error {
  box-shadow: 0 4px 14px 0 hsl(var(--destructive) / 0.2);
}
```

## 🎭 Animation & Transitions

### Existing Animation System

**Current Animations** (from globals.css)

```css
/* Existing keyframes and animations */
@keyframes accordion-down {
  from {
    height: 0;
  }
  to {
    height: var(--radix-accordion-content-height);
  }
}

@keyframes accordion-up {
  from {
    height: var(--radix-accordion-content-height);
  }
  to {
    height: 0;
  }
}

/* Custom animations already defined */
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

@keyframes status-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

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

@keyframes field-focus {
  from {
    box-shadow: 0 0 0 0 oklch(var(--ring) / 0.4);
  }
  to {
    box-shadow: 0 0 0 4px oklch(var(--ring) / 0.1);
  }
}
```

**Animation Usage Guidelines**

- Leverage existing animations and Tailwind's animation utilities
- Use `animate-spin`, `animate-pulse`, `animate-bounce` for loading states
- Apply existing custom animations for specific interactions
- Maintain consistent timing and easing across interfaces

**Transition Patterns**

- Use Tailwind's transition utilities (`transition-all`, `duration-200`, etc.)
- Apply consistent easing with `ease-out` for interface interactions
- Use existing `--ring` color for focus animations

## 🧩 Component Design Patterns

### Button Patterns (Using Existing Tokens)

**Button Styling Guidelines**

```css
/* Use existing spacing and typography tokens */
.button-sm {
  padding: var(--spacing-component-sm) var(--spacing-component-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius);
}

.button-md {
  padding: var(--spacing-component-md) var(--spacing-component-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius);
}

.button-lg {
  padding: var(--spacing-component-lg) var(--spacing-component-xl);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius);
}
```

### Form Element Patterns (Using Existing Tokens)

**Input Styling Guidelines**

```css
/* Use existing spacing, border, and typography tokens */
.input-field {
  padding: var(--spacing-component-md);
  font-size: var(--font-size-base);
  border: 1px solid hsl(var(--input));
  border-radius: var(--radius);
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}

.input-field:focus {
  border-color: hsl(var(--ring));
  outline: 2px solid hsl(var(--ring) / 0.2);
  outline-offset: 2px;
}
```

### Card Patterns (Using Existing Tokens)

**Card Styling Guidelines**

```css
/* Use existing spacing, surface, and radius tokens */
.card {
  padding: var(--spacing-component-lg);
  background-color: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  color: hsl(var(--card-foreground));
}

.card-header {
  padding-bottom: var(--spacing-component-md);
  border-bottom: 1px solid hsl(var(--border));
  margin-bottom: var(--spacing-component-lg);
}
```

## 🎪 Icon System

### Icon Implementation Guidelines

**Icon Sizes** (using Tailwind size classes)

- **xs**: `size-3` (12px) - Small indicators, badges
- **sm**: `size-4` (16px) - Default interface icons
- **md**: `size-5` (20px) - Buttons, navigation
- **lg**: `size-6` (24px) - Headers, important actions
- **xl**: `size-8` (32px) - Feature icons, avatars
- **2xl**: `size-10` (40px) - Large feature displays

**Icon Color Patterns** (using existing color tokens)

```css
/* Status icons using existing chart colors */
.icon-success {
  color: hsl(var(--chart-5));
}
.icon-warning {
  color: hsl(var(--chart-4));
}
.icon-error {
  color: hsl(var(--destructive));
}
.icon-info {
  color: hsl(var(--chart-2));
}
.icon-muted {
  color: hsl(var(--muted-foreground));
}
```

**Icon Usage Guidelines**

- Use Lucide React for consistent icon library
- Maintain 1.5px stroke width for visual consistency
- Apply semantic colors using existing color tokens
- Use appropriate sizes for context and hierarchy

## 🔍 Accessibility Standards

### Color Contrast Requirements

**WCAG 2.1 AA Compliance**

- Minimum 4.5:1 contrast ratio for normal text
- Minimum 3:1 contrast ratio for large text (18pt+)
- Minimum 3:1 contrast ratio for UI components and graphics

**Testing Requirements**

- All color combinations tested for contrast compliance
- Color-blind accessibility verification
- High contrast mode compatibility

### Focus Management

```css
--focus-ring-width: 2px;
--focus-ring-style: solid;
--focus-ring-color: var(--color-interactive-focus-ring);
--focus-ring-offset: 2px;
```

### Motion Preferences

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## 📱 Responsive Design Principles

### Mobile-First Approach

**Design Philosophy**

- Start with mobile constraints for focused design
- Progressive enhancement for larger screens
- Touch-friendly interaction targets (44px minimum)
- Readable typography at all sizes

**Content Strategy**

- Prioritize essential content on smaller screens
- Use progressive disclosure for complex interfaces
- Maintain functionality across all breakpoints
- Optimize performance for mobile devices

### Adaptive Layout Patterns

**Navigation Adaptation**

- Collapsible sidebar on mobile
- Tab bar for primary navigation on small screens
- Contextual actions in slide-out panels
- Search functionality in overlay format

**Content Layout**

- Single column layout on mobile
- Multi-column grid on tablet and desktop
- Flexible card-based layouts
- Responsive typography scaling

---

## 🔗 Related Documentation

### **📖 Implementation Guides**

- **[Color Palette Specification](./color-palette-specification.md)** - Extended color system details **(15 min)**
- **[Typography System](./typography-system.md)** - Complete typography implementation **(10 min)**
- **[Component Design Guidelines](./component-design-guidelines.md)** - Visual component patterns **(20 min)**
- **[Layout and Spacing](./layout-and-spacing.md)** - Grid systems and spacing rules **(10 min)**

### **🏗️ Implementation Planning**

- **[Implementation Plan](./implementation-plan.md)** - Detailed execution strategy **(15 min)**
- **[Component Migration Guide](./component-migration-guide.md)** - Step-by-step transformation **(20 min)**

### **🔙 Navigation**

- **[← Back to Design Documentation](./README.md)**
- **[↑ Main Documentation](../README.md)**
- **[🔍 Search & Glossary](../glossary-and-search.md)** - Find specific design concepts

### **🎯 Next Steps**

1. **Review:** Complete design system specification
2. **Detail:** Read individual component guidelines
3. **Plan:** Review implementation strategy
4. **Implement:** Execute visual transformation

**💡 Remember:** This design system serves as the foundation for all visual decisions in Project Wiz. Consistency in application creates a cohesive, professional user experience.
