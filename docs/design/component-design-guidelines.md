# Component Design Guidelines

This document establishes comprehensive visual design guidelines for all UI components in Project Wiz, creating consistent, professional, and engaging interfaces using existing design tokens.

## 🎨 Component Design Philosophy

### Design Approach

**Token-Based Consistency**

- Leverage existing design tokens for all visual properties
- Create semantic patterns that enhance usability
- Establish clear visual hierarchy through strategic component design
- Maintain consistency across all interface elements

**Professional Interface Standards**

- Modern, clean aesthetic suitable for enterprise environments
- Clear visual feedback for all interactive states
- Accessible design meeting WCAG 2.1 AA standards
- Optimized for AI-focused workflows and complex data presentation

## 🧩 Core Component Guidelines

### Button Components

**Primary Button Design**

```css
.btn-primary {
  /* Using existing tokens */
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: 1px solid hsl(var(--primary));
  border-radius: var(--radius);
  padding: var(--spacing-component-md) var(--spacing-component-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all 0.2s ease-out;
}

.btn-primary:hover {
  background-color: hsl(var(--primary) / 0.9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px hsl(var(--primary) / 0.25);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px hsl(var(--primary) / 0.25);
}

.btn-primary:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

**Secondary Button Design**

```css
.btn-secondary {
  background-color: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  padding: var(--spacing-component-md) var(--spacing-component-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all 0.2s ease-out;
}

.btn-secondary:hover {
  background-color: hsl(var(--accent));
  border-color: hsl(var(--ring));
}
```

**Destructive Button Design**

```css
.btn-destructive {
  background-color: hsl(var(--destructive));
  color: hsl(var(--primary-foreground));
  border: 1px solid hsl(var(--destructive));
  border-radius: var(--radius);
  padding: var(--spacing-component-md) var(--spacing-component-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all 0.2s ease-out;
}

.btn-destructive:hover {
  background-color: hsl(var(--destructive) / 0.9);
  box-shadow: 0 4px 12px hsl(var(--destructive) / 0.25);
}
```

**Button Size Variations**

```css
/* Small buttons */
.btn-sm {
  padding: var(--spacing-component-sm) var(--spacing-component-md);
  font-size: var(--font-size-xs);
  height: 32px;
}

/* Medium buttons (default) */
.btn-md {
  padding: var(--spacing-component-md) var(--spacing-component-lg);
  font-size: var(--font-size-sm);
  height: 40px;
}

/* Large buttons */
.btn-lg {
  padding: var(--spacing-component-lg) var(--spacing-component-xl);
  font-size: var(--font-size-base);
  height: 48px;
}
```

### Form Input Components

**Input Field Design**

```css
.input-field {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--input));
  border-radius: var(--radius);
  padding: var(--spacing-component-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  transition: all 0.2s ease-out;
  min-height: 40px;
}

.input-field:focus {
  border-color: hsl(var(--ring));
  outline: 2px solid hsl(var(--ring) / 0.2);
  outline-offset: -1px;
  box-shadow: 0 0 0 3px hsl(var(--ring) / 0.1);
}

.input-field:hover:not(:focus) {
  border-color: hsl(var(--ring) / 0.5);
}

.input-field::placeholder {
  color: hsl(var(--muted-foreground));
  font-weight: var(--font-weight-normal);
}

.input-field:disabled {
  background-color: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
  cursor: not-allowed;
  opacity: 0.6;
}
```

**Input Label Design**

```css
.input-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: hsl(var(--foreground));
  margin-bottom: var(--spacing-component-sm);
  display: block;
}

.input-label.required::after {
  content: " *";
  color: hsl(var(--destructive));
}
```

**Input Help Text**

```css
.input-help {
  font-size: var(--font-size-xs);
  color: hsl(var(--muted-foreground));
  margin-top: var(--spacing-component-xs);
  line-height: var(--line-height-normal);
}

.input-error {
  font-size: var(--font-size-xs);
  color: hsl(var(--destructive));
  margin-top: var(--spacing-component-xs);
  display: flex;
  align-items: center;
  gap: var(--spacing-component-xs);
}
```

### Card Components

**Base Card Design**

```css
.card {
  background-color: hsl(var(--card));
  color: hsl(var(--card-foreground));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  padding: var(--spacing-component-lg);
  box-shadow: 0 1px 3px hsl(var(--foreground) / 0.05);
  transition: all 0.2s ease-out;
}

.card:hover {
  border-color: hsl(var(--ring) / 0.3);
  box-shadow: 0 4px 12px hsl(var(--foreground) / 0.1);
}

.card-interactive {
  cursor: pointer;
}

.card-interactive:hover {
  transform: translateY(-1px);
  border-color: hsl(var(--ring) / 0.5);
  box-shadow: 0 6px 20px hsl(var(--foreground) / 0.15);
}

.card-interactive:active {
  transform: translateY(0);
}
```

**Card Header Design**

```css
.card-header {
  padding-bottom: var(--spacing-component-lg);
  margin-bottom: var(--spacing-component-lg);
  border-bottom: 1px solid hsl(var(--border));
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: hsl(var(--card-foreground));
  margin-bottom: var(--spacing-component-xs);
}

.card-description {
  font-size: var(--font-size-sm);
  color: hsl(var(--muted-foreground));
  line-height: var(--line-height-normal);
}
```

**Card Content Design**

```css
.card-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-component-md);
}

.card-footer {
  padding-top: var(--spacing-component-lg);
  margin-top: var(--spacing-component-lg);
  border-top: 1px solid hsl(var(--border));
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-component-sm);
}
```

### Navigation Components

**Sidebar Navigation Design**

```css
.sidebar-nav {
  background-color: hsl(var(--sidebar));
  color: hsl(var(--sidebar-foreground));
  border-right: 1px solid hsl(var(--sidebar-border));
  padding: var(--spacing-layout-sm);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-component-sm);
  padding: var(--spacing-component-sm) var(--spacing-component-md);
  border-radius: var(--radius);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all 0.2s ease-out;
  margin-bottom: var(--spacing-component-xs);
}

.nav-item:hover {
  background-color: hsl(var(--sidebar-accent));
}

.nav-item.active {
  background-color: hsl(var(--sidebar-primary));
  color: hsl(var(--sidebar-primary-foreground));
}

.nav-item.active:hover {
  background-color: hsl(var(--sidebar-primary) / 0.9);
}
```

**Tab Navigation Design**

```css
.tab-list {
  display: flex;
  border-bottom: 1px solid hsl(var(--border));
  gap: var(--spacing-component-sm);
}

.tab-item {
  padding: var(--spacing-component-md) var(--spacing-component-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: hsl(var(--muted-foreground));
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease-out;
  cursor: pointer;
}

.tab-item:hover {
  color: hsl(var(--foreground));
  border-bottom-color: hsl(var(--ring) / 0.3);
}

.tab-item.active {
  color: hsl(var(--foreground));
  border-bottom-color: hsl(var(--primary));
}
```

### Status and Feedback Components

**Badge Design** (using existing chart colors)

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-component-xs) var(--spacing-component-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  border-radius: calc(var(--radius) + 2px);
  border: 1px solid transparent;
}

.badge-success {
  background-color: hsl(var(--chart-5) / 0.1);
  color: hsl(var(--chart-5));
  border-color: hsl(var(--chart-5) / 0.2);
}

.badge-warning {
  background-color: hsl(var(--chart-4) / 0.1);
  color: hsl(var(--chart-4));
  border-color: hsl(var(--chart-4) / 0.2);
}

.badge-error {
  background-color: hsl(var(--destructive) / 0.1);
  color: hsl(var(--destructive));
  border-color: hsl(var(--destructive) / 0.2);
}

.badge-info {
  background-color: hsl(var(--chart-2) / 0.1);
  color: hsl(var(--chart-2));
  border-color: hsl(var(--chart-2) / 0.2);
}

.badge-neutral {
  background-color: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
  border-color: hsl(var(--border));
}
```

**Status Indicator Design**

```css
.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  position: relative;
}

.status-indicator.active {
  background-color: hsl(var(--chart-5));
}

.status-indicator.busy {
  background-color: hsl(var(--chart-4));
  animation: status-pulse 2s ease-in-out infinite;
}

.status-indicator.error {
  background-color: hsl(var(--destructive));
}

.status-indicator.idle {
  background-color: hsl(var(--chart-2));
}

.status-indicator.offline {
  background-color: hsl(var(--muted-foreground));
}
```

**Alert Component Design**

```css
.alert {
  padding: var(--spacing-component-lg);
  border-radius: var(--radius);
  border: 1px solid;
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-component-sm);
}

.alert-success {
  background-color: hsl(var(--chart-5) / 0.1);
  border-color: hsl(var(--chart-5) / 0.2);
  color: hsl(var(--chart-5));
}

.alert-warning {
  background-color: hsl(var(--chart-4) / 0.1);
  border-color: hsl(var(--chart-4) / 0.2);
  color: hsl(var(--chart-4));
}

.alert-error {
  background-color: hsl(var(--destructive) / 0.1);
  border-color: hsl(var(--destructive) / 0.2);
  color: hsl(var(--destructive));
}

.alert-info {
  background-color: hsl(var(--chart-2) / 0.1);
  border-color: hsl(var(--chart-2) / 0.2);
  color: hsl(var(--chart-2));
}
```

### Modal and Dialog Components

**Modal Overlay Design**

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: hsl(var(--background) / 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-layout-md);
  z-index: 50;
}

.modal-content {
  background-color: hsl(var(--popover));
  color: hsl(var(--popover-foreground));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  padding: var(--spacing-layout-md);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 50px hsl(var(--foreground) / 0.2);
  animation: modal-enter 0.2s ease-out;
}

@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

**Dialog Header Design**

```css
.dialog-header {
  margin-bottom: var(--spacing-component-lg);
  padding-bottom: var(--spacing-component-lg);
  border-bottom: 1px solid hsl(var(--border));
}

.dialog-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: hsl(var(--popover-foreground));
  margin-bottom: var(--spacing-component-xs);
}

.dialog-description {
  font-size: var(--font-size-sm);
  color: hsl(var(--muted-foreground));
  line-height: var(--line-height-normal);
}
```

## 🎯 Component State Patterns

### Interactive States

**Hover States**

- Subtle elevation through transform and shadow
- Color adjustments using opacity or color variations
- Consistent timing (0.2s ease-out) across all components
- Visual feedback appropriate to component importance

**Focus States**

- Visible focus rings using `--ring` color
- Consistent outline offset (2px)
- Additional shadow for enhanced visibility
- Keyboard navigation support

**Active States**

- Reduced elevation to indicate interaction
- Slight scale or transform adjustments
- Immediate visual feedback
- Return to resting state on release

**Disabled States**

- Reduced opacity (0.6)
- Muted colors using `--muted-foreground`
- Cursor pointer changes to not-allowed
- No interactive feedback

### Loading States

**Skeleton Loading**

```css
.skeleton {
  background: linear-gradient(
    90deg,
    hsl(var(--muted)) 25%,
    hsl(var(--muted) / 0.5) 50%,
    hsl(var(--muted)) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: var(--radius);
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

**Spinner Loading**

```css
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid hsl(var(--muted));
  border-top: 2px solid hsl(var(--primary));
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
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
/**
 * AgentCard Component
 *
 * Displays agent information with status indicators and actions.
 * Uses design tokens for consistent spacing, colors, and typography.
 *
 * Design Tokens Used:
 * - Colors: --card, --card-foreground, --border, --chart-5
 * - Spacing: --spacing-component-lg, --spacing-component-md
 * - Typography: --font-size-base, --font-weight-semibold
 * - Radius: --radius
 *
 * @param agent - Agent data object
 * @param onEdit - Edit handler function
 * @param onDelete - Delete handler function
 */
function AgentCard({ agent, onEdit, onDelete }) {
  // Component implementation
}
```

---

## 🔗 Related Documentation

### **📖 Essential Context**

- **[Design System Specification](./design-system-specification.md)** - Complete design system overview **(20 min)**
- **[Color Palette Specification](./color-palette-specification.md)** - Color usage in components **(15 min)**
- **[Typography System](./typography-system.md)** - Typography in component design **(10 min)**
- **[Layout and Spacing](./layout-and-spacing.md)** - Spacing patterns in components **(10 min)**

### **🏗️ Implementation Guides**

- **[Implementation Plan](./implementation-plan.md)** - Component transformation strategy **(15 min)**

### **🔙 Navigation**

- **[← Back to Design Documentation](./README.md)**
- **[↑ Main Documentation](../README.md)**
- **[🔍 Search & Glossary](../glossary-and-search.md)** - Find specific component patterns

### **🎯 Next Steps**

1. **Study:** Component patterns and design tokens usage
2. **Apply:** Implement consistent visual patterns across components
3. **Test:** Verify component states and accessibility
4. **Document:** Comment design decisions in component code

**💡 Remember:** These component guidelines ensure visual consistency and professional quality across all interfaces. Proper implementation creates a cohesive user experience that users trust and enjoy using.
