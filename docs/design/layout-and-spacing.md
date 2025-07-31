# Layout and Spacing

This document defines the layout principles and spacing guidelines for Project Wiz, establishing consistent spatial relationships and visual rhythm throughout the interface using existing design tokens.

## 📐 Spacing Philosophy

### Design Approach

**Existing Token Utilization**

- Leverage current spacing tokens from globals.css without modification
- Create systematic spacing patterns for consistent visual rhythm
- Establish clear hierarchy through strategic space application
- Maintain responsive behavior across all screen sizes

**Professional Spatial Design**

- Generous whitespace for breathing room and clarity
- Consistent spacing ratios for predictable layouts
- Strategic density for optimal information architecture
- Modern layout patterns suitable for complex AI interfaces

## 🎯 Current Spacing System

### Existing Spacing Tokens

**Component-Level Spacing** (from globals.css)

```css
--spacing-component-xs: 0.25rem; /* 4px - Minimal spacing */
--spacing-component-sm: 0.5rem; /* 8px - Small elements */
--spacing-component-md: 0.75rem; /* 12px - Medium spacing */
--spacing-component-lg: 1rem; /* 16px - Standard spacing */
--spacing-component-xl: 1.5rem; /* 24px - Large spacing */
--spacing-component-2xl: 2rem; /* 32px - Extra large */
```

**Layout-Level Spacing** (from globals.css)

```css
--spacing-layout-xs: 0.5rem; /* 8px - Tight layouts */
--spacing-layout-sm: 1rem; /* 16px - Compact sections */
--spacing-layout-md: 1.5rem; /* 24px - Standard sections */
--spacing-layout-lg: 2rem; /* 32px - Generous spacing */
--spacing-layout-xl: 3rem; /* 48px - Large sections */
--spacing-layout-2xl: 4rem; /* 64px - Page sections */
```

### Spacing Scale Ratios

**Mathematical Relationships**

- **Base Unit**: 4px (--spacing-component-xs)
- **Scale Factor**: 1.5x - 2x progression for visual harmony
- **Component Scale**: 4px → 8px → 12px → 16px → 24px → 32px
- **Layout Scale**: 8px → 16px → 24px → 32px → 48px → 64px

**Semantic Applications**

- **Component tokens**: Internal spacing within UI elements
- **Layout tokens**: External spacing between major sections
- **Consistent ratios**: Maintain visual relationships across scales

## 🏗️ Layout Patterns

### Page Layout Structure

**Main Layout Hierarchy**

```css
/* Page-level spacing using layout tokens */
.page-container {
  padding: var(--spacing-layout-lg); /* 32px - Page edges */
}

.section-spacing {
  margin-bottom: var(--spacing-layout-xl); /* 48px - Section separation */
}

.content-spacing {
  margin-bottom: var(--spacing-layout-md); /* 24px - Content blocks */
}
```

**Responsive Page Spacing**

```css
/* Mobile adjustments */
@media (max-width: 768px) {
  .page-container {
    padding: var(--spacing-layout-sm); /* 16px - Reduced mobile padding */
  }

  .section-spacing {
    margin-bottom: var(
      --spacing-layout-lg
    ); /* 32px - Reduced mobile sections */
  }
}
```

### Component Spacing Patterns

**Card Components**

```css
/* Card internal spacing using component tokens */
.card {
  padding: var(--spacing-component-lg); /* 16px - Card padding */
}

.card-header {
  padding-bottom: var(--spacing-component-md); /* 12px - Header spacing */
  margin-bottom: var(--spacing-component-lg); /* 16px - Header separation */
}

.card-content {
  gap: var(--spacing-component-md); /* 12px - Content item gaps */
}

.card-actions {
  padding-top: var(--spacing-component-lg); /* 16px - Action area spacing */
  margin-top: var(--spacing-component-lg); /* 16px - Action separation */
}
```

**Form Components**

```css
/* Form spacing using component tokens */
.form-group {
  margin-bottom: var(--spacing-component-xl); /* 24px - Form field groups */
}

.form-field {
  margin-bottom: var(--spacing-component-lg); /* 16px - Individual fields */
}

.form-label {
  margin-bottom: var(--spacing-component-sm); /* 8px - Label to input */
}

.form-help {
  margin-top: var(--spacing-component-xs); /* 4px - Help text spacing */
}

.form-actions {
  margin-top: var(--spacing-component-2xl); /* 32px - Action button area */
  gap: var(--spacing-component-md); /* 12px - Button spacing */
}
```

**List Components**

```css
/* List and navigation spacing */
.list-item {
  padding: var(--spacing-component-md); /* 12px - List item padding */
  margin-bottom: var(--spacing-component-xs); /* 4px - Item separation */
}

.nav-item {
  padding: var(--spacing-component-sm) var(--spacing-component-md); /* 8px 12px */
  margin-bottom: var(--spacing-component-xs); /* 4px - Nav item spacing */
}

.menu-section {
  margin-bottom: var(--spacing-component-lg); /* 16px - Menu section gaps */
}
```

### Grid and Flexbox Patterns

**Grid Layouts**

```css
/* Grid spacing using component tokens */
.grid-container {
  gap: var(--spacing-component-lg); /* 16px - Grid gaps */
}

.grid-tight {
  gap: var(--spacing-component-md); /* 12px - Compact grids */
}

.grid-loose {
  gap: var(--spacing-component-xl); /* 24px - Spacious grids */
}
```

**Flexbox Layouts**

```css
/* Flexbox spacing patterns */
.flex-row {
  gap: var(--spacing-component-md); /* 12px - Horizontal spacing */
}

.flex-column {
  gap: var(--spacing-component-lg); /* 16px - Vertical spacing */
}

.flex-tight {
  gap: var(--spacing-component-sm); /* 8px - Compact flex */
}
```

## 📱 Responsive Layout Principles

### Breakpoint Strategy

**Mobile-First Approach** (using Tailwind breakpoints)

- **Base (0px)**: Mobile layout with minimal spacing
- **sm (640px)**: Small tablet adjustments
- **md (768px)**: Tablet layout with moderate spacing
- **lg (1024px)**: Desktop layout with generous spacing
- **xl (1280px)**: Large desktop optimizations

### Responsive Spacing Adjustments

**Mobile Optimizations**

```css
/* Reduce spacing on smaller screens */
@media (max-width: 640px) {
  .responsive-spacing {
    padding: var(--spacing-layout-xs); /* 8px - Mobile padding */
  }

  .responsive-gap {
    gap: var(--spacing-component-sm); /* 8px - Mobile gaps */
  }

  .responsive-margin {
    margin-bottom: var(--spacing-layout-sm); /* 16px - Mobile margins */
  }
}
```

**Desktop Enhancements**

```css
/* Increase spacing on larger screens */
@media (min-width: 1024px) {
  .responsive-spacing {
    padding: var(--spacing-layout-xl); /* 48px - Desktop padding */
  }

  .responsive-gap {
    gap: var(--spacing-component-xl); /* 24px - Desktop gaps */
  }

  .responsive-margin {
    margin-bottom: var(--spacing-layout-2xl); /* 64px - Desktop margins */
  }
}
```

## 🎨 Visual Hierarchy through Spacing

### Content Hierarchy

**Information Architecture Spacing**

```css
/* Create visual hierarchy through spacing */
.hierarchy-major {
  margin-bottom: var(--spacing-layout-2xl); /* 64px - Major sections */
}

.hierarchy-section {
  margin-bottom: var(--spacing-layout-lg); /* 32px - Section breaks */
}

.hierarchy-subsection {
  margin-bottom: var(--spacing-layout-md); /* 24px - Subsections */
}

.hierarchy-content {
  margin-bottom: var(--spacing-layout-sm); /* 16px - Content blocks */
}

.hierarchy-detail {
  margin-bottom: var(--spacing-component-lg); /* 16px - Detail items */
}
```

### Component Density Levels

**High Density** (for data-heavy interfaces)

```css
.density-high {
  padding: var(--spacing-component-sm); /* 8px - Compact padding */
  gap: var(--spacing-component-xs); /* 4px - Minimal gaps */
  margin-bottom: var(--spacing-component-md); /* 12px - Tight margins */
}
```

**Medium Density** (default interface density)

```css
.density-medium {
  padding: var(--spacing-component-md); /* 12px - Standard padding */
  gap: var(--spacing-component-sm); /* 8px - Comfortable gaps */
  margin-bottom: var(--spacing-component-lg); /* 16px - Balanced margins */
}
```

**Low Density** (for content focus)

```css
.density-low {
  padding: var(--spacing-component-xl); /* 24px - Generous padding */
  gap: var(--spacing-component-lg); /* 16px - Spacious gaps */
  margin-bottom: var(--spacing-layout-md); /* 24px - Relaxed margins */
}
```

## 🏭 Layout Component Patterns

### Sidebar Layouts

**Main Sidebar Structure**

```css
/* Sidebar spacing using layout tokens */
.sidebar {
  padding: var(--spacing-layout-sm); /* 16px - Sidebar padding */
}

.sidebar-section {
  margin-bottom: var(--spacing-layout-md); /* 24px - Section spacing */
}

.sidebar-item {
  padding: var(--spacing-component-sm) var(--spacing-component-md);
  margin-bottom: var(--spacing-component-xs); /* 4px - Item spacing */
}

.sidebar-header {
  padding-bottom: var(--spacing-component-lg); /* 16px - Header spacing */
  margin-bottom: var(--spacing-component-lg); /* 16px - Header separation */
}
```

### Dashboard Layouts

**Dashboard Grid Patterns**

```css
/* Dashboard component spacing */
.dashboard-grid {
  gap: var(--spacing-layout-md); /* 24px - Dashboard gaps */
  padding: var(--spacing-layout-lg); /* 32px - Dashboard padding */
}

.dashboard-widget {
  padding: var(--spacing-component-lg); /* 16px - Widget padding */
}

.dashboard-section {
  margin-bottom: var(--spacing-layout-xl); /* 48px - Section spacing */
}
```

### Modal and Dialog Layouts

**Modal Spacing Patterns**

```css
/* Modal content spacing */
.modal-content {
  padding: var(--spacing-layout-md); /* 24px - Modal padding */
}

.modal-header {
  padding-bottom: var(--spacing-component-lg); /* 16px - Header spacing */
  margin-bottom: var(--spacing-component-lg); /* 16px - Header separation */
}

.modal-body {
  margin-bottom: var(--spacing-component-xl); /* 24px - Body spacing */
}

.modal-actions {
  padding-top: var(--spacing-component-lg); /* 16px - Action area */
  gap: var(--spacing-component-md); /* 12px - Button spacing */
}
```

## 🔧 Implementation Guidelines

### CSS Utility Classes

**Spacing Utility Patterns** (using existing tokens)

```css
/* Padding utilities */
.p-component-xs {
  padding: var(--spacing-component-xs);
}
.p-component-sm {
  padding: var(--spacing-component-sm);
}
.p-component-md {
  padding: var(--spacing-component-md);
}
.p-component-lg {
  padding: var(--spacing-component-lg);
}
.p-component-xl {
  padding: var(--spacing-component-xl);
}
.p-component-2xl {
  padding: var(--spacing-component-2xl);
}

/* Margin utilities */
.m-layout-xs {
  margin: var(--spacing-layout-xs);
}
.m-layout-sm {
  margin: var(--spacing-layout-sm);
}
.m-layout-md {
  margin: var(--spacing-layout-md);
}
.m-layout-lg {
  margin: var(--spacing-layout-lg);
}
.m-layout-xl {
  margin: var(--spacing-layout-xl);
}
.m-layout-2xl {
  margin: var(--spacing-layout-2xl);
}

/* Gap utilities */
.gap-component-sm {
  gap: var(--spacing-component-sm);
}
.gap-component-md {
  gap: var(--spacing-component-md);
}
.gap-component-lg {
  gap: var(--spacing-component-lg);
}
.gap-component-xl {
  gap: var(--spacing-component-xl);
}
```

### Component Spacing Patterns

**React Component Examples**

```tsx
// Example component using spacing tokens
function AgentCard({ agent, className = "" }) {
  return (
    <div
      className={`
      p-[var(--spacing-component-lg)]
      mb-[var(--spacing-component-md)]
      gap-[var(--spacing-component-sm)]
      ${className}
    `}
    >
      <div className="mb-[var(--spacing-component-md)]">
        <h3>{agent.name}</h3>
      </div>
      <div className="space-y-[var(--spacing-component-xs)]">
        {/* Agent details */}
      </div>
    </div>
  );
}
```

### Best Practices

**Spacing Rules**

1. **Always use design tokens** - Never hardcode spacing values
2. **Maintain consistent ratios** - Use tokens that follow the established scale
3. **Consider responsive behavior** - Adjust spacing appropriately for screen size
4. **Test across devices** - Ensure spacing works on all target devices

**Layout Guidelines**

- Use layout tokens for major structural spacing
- Use component tokens for internal element spacing
- Maintain visual rhythm through consistent token application
- Consider content hierarchy when choosing spacing levels

## 🔍 Accessibility Considerations

### Touch Target Spacing

**Minimum Touch Targets** (for mobile interfaces)

```css
/* Ensure adequate touch target spacing */
.touch-target {
  min-height: 44px; /* iOS guideline minimum */
  padding: var(--spacing-component-md); /* 12px minimum padding */
  margin: var(--spacing-component-xs); /* 4px separation */
}
```

### Focus Management

**Focus Indicator Spacing**

```css
/* Focus indicators with proper spacing */
.focus-target {
  outline-offset: 2px; /* Space between element and outline */
  margin: var(--spacing-component-xs); /* Space for focus indicators */
}
```

### Reading Comfort

**Text Spacing for Readability**

```css
/* Comfortable reading spacing */
.readable-content {
  line-height: var(--line-height-relaxed); /* 1.75 for body text */
  margin-bottom: var(--spacing-layout-sm); /* 16px paragraph spacing */
  max-width: 65ch; /* Optimal reading line length */
}
```

---

## 🔗 Related Documentation

### **📖 Essential Context**

- **[Component Design Guidelines](./component-design-guidelines.md)** - Complete component implementation guide **(25 min)**
- **[Color Palette Specification](./color-palette-specification.md)** - Color system for visual hierarchy **(15 min)**
- **[Typography System](./typography-system.md)** - Typography spacing and scale **(10 min)**

### **🏗️ Implementation Guides**

- **[Component Design Guidelines](./component-design-guidelines.md)** - Component spacing patterns **(15 min)**
- **[Implementation Plan](./implementation-plan.md)** - Layout implementation strategy **(15 min)**

### **🔙 Navigation**

- **[← Back to Design Documentation](./README.md)**
- **[↑ Main Documentation](../README.md)**
- **[🔍 Search & Glossary](../glossary-and-search.md)** - Find specific layout concepts

### **🎯 Next Steps**

1. **Review:** Spacing tokens and layout patterns
2. **Apply:** Use existing tokens for consistent spacing
3. **Test:** Verify layouts across different screen sizes
4. **Document:** Comment spacing choices in component code

**💡 Remember:** This layout system leverages existing design tokens to create consistent spatial relationships and professional visual hierarchy. Proper spacing application is crucial for creating interfaces that feel cohesive and well-designed.
