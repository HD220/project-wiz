# Typography System

This document defines the complete typography system for Project Wiz based on the existing typography tokens in globals.css, establishing clear hierarchy, readability, and professional visual communication.

## 📝 Typography Philosophy

### Design Approach

**Existing Token Optimization**

- Leverage current typography tokens without modification
- Create semantic usage patterns for consistent application
- Establish clear hierarchy through strategic font size and weight combinations
- Enhance readability and professional appearance

**Professional Technical Communication**

- Clear hierarchy for complex technical information
- Readable typography optimized for extended screen time
- Professional appearance suitable for enterprise environments
- Accessibility-focused design for inclusive user experience

## 🔤 Current Typography System

### Font Size Scale (Existing Tokens)

**Current Size Tokens**

```css
/* Existing typography size tokens */
--font-size-xs: 0.75rem; /* 12px - Captions, labels */
--font-size-sm: 0.875rem; /* 14px - Small text, secondary info */
--font-size-base: 1rem; /* 16px - Body text, default */
--font-size-lg: 1.125rem; /* 18px - Large body text */
--font-size-xl: 1.25rem; /* 20px - Small headings */
--font-size-2xl: 1.5rem; /* 24px - Medium headings */
--font-size-3xl: 1.875rem; /* 30px - Large headings */
```

### Line Height Scale (Existing Tokens)

**Current Line Height Tokens**

```css
/* Existing line height tokens */
--line-height-tight: 1.25; /* Tight spacing for headings */
--line-height-normal: 1.5; /* Normal spacing for body text */
--line-height-relaxed: 1.75; /* Relaxed spacing for comfortable reading */
```

### Font Weight Scale (Existing Tokens)

**Current Weight Tokens**

```css
/* Existing font weight tokens */
--font-weight-normal: 400; /* Regular text */
--font-weight-medium: 500; /* Medium emphasis */
--font-weight-semibold: 600; /* Strong emphasis */
--font-weight-bold: 700; /* Bold headings */
```

## 🎯 Typography Hierarchy

### Heading System

**H1 - Page Titles**

```css
.heading-1 {
  font-size: var(--font-size-3xl); /* 30px */
  font-weight: var(--font-weight-bold); /* 700 */
  line-height: var(--line-height-tight); /* 1.25 */
  color: hsl(var(--foreground));
}
```

**Usage:** Main page titles, primary headers
**Examples:** "AI Agents", "Project Settings", "Dashboard"

**H2 - Section Headers**

```css
.heading-2 {
  font-size: var(--font-size-2xl); /* 24px */
  font-weight: var(--font-weight-semibold); /* 600 */
  line-height: var(--line-height-tight); /* 1.25 */
  color: hsl(var(--foreground));
}
```

**Usage:** Major section headings, card titles
**Examples:** "Recent Conversations", "Agent Configuration"

**H3 - Subsection Headers**

```css
.heading-3 {
  font-size: var(--font-size-xl); /* 20px */
  font-weight: var(--font-weight-semibold); /* 600 */
  line-height: var(--line-height-tight); /* 1.25 */
  color: hsl(var(--foreground));
}
```

**Usage:** Subsection titles, component headers
**Examples:** "API Configuration", "User Preferences"

**H4 - Component Titles**

```css
.heading-4 {
  font-size: var(--font-size-lg); /* 18px */
  font-weight: var(--font-weight-medium); /* 500 */
  line-height: var(--line-height-normal); /* 1.5 */
  color: hsl(var(--foreground));
}
```

**Usage:** Component titles, form section headers
**Examples:** "Basic Information", "Advanced Settings"

### Body Text System

**Large Body Text**

```css
.text-large {
  font-size: var(--font-size-lg); /* 18px */
  font-weight: var(--font-weight-normal); /* 400 */
  line-height: var(--line-height-relaxed); /* 1.75 */
  color: hsl(var(--foreground));
}
```

**Usage:** Important body content, feature descriptions
**Examples:** Main content areas, important notifications

**Default Body Text**

```css
.text-body {
  font-size: var(--font-size-base); /* 16px */
  font-weight: var(--font-weight-normal); /* 400 */
  line-height: var(--line-height-normal); /* 1.5 */
  color: hsl(var(--foreground));
}
```

**Usage:** Standard body text, form inputs, most interface text
**Examples:** Paragraphs, form labels, button text

**Small Body Text**

```css
.text-small {
  font-size: var(--font-size-sm); /* 14px */
  font-weight: var(--font-weight-normal); /* 400 */
  line-height: var(--line-height-normal); /* 1.5 */
  color: hsl(var(--muted-foreground));
}
```

**Usage:** Secondary information, helper text
**Examples:** Timestamps, secondary descriptions, metadata

**Caption Text**

```css
.text-caption {
  font-size: var(--font-size-xs); /* 12px */
  font-weight: var(--font-weight-normal); /* 400 */
  line-height: var(--line-height-normal); /* 1.5 */
  color: hsl(var(--muted-foreground));
}
```

**Usage:** Captions, fine print, status indicators
**Examples:** Agent status labels, copyright text, version numbers

### UI Element Typography

**Button Text**

```css
.button-text {
  font-size: var(--font-size-sm); /* 14px */
  font-weight: var(--font-weight-medium); /* 500 */
  line-height: var(--line-height-tight); /* 1.25 */
}
```

**Usage:** All button labels and CTAs
**Examples:** "Create Agent", "Save Changes", "Cancel"

**Input Labels**

```css
.label-text {
  font-size: var(--font-size-sm); /* 14px */
  font-weight: var(--font-weight-medium); /* 500 */
  line-height: var(--line-height-normal); /* 1.5 */
  color: hsl(var(--foreground));
}
```

**Usage:** Form field labels, setting labels
**Examples:** "Agent Name", "API Key", "Model Selection"

**Navigation Text**

```css
.nav-text {
  font-size: var(--font-size-sm); /* 14px */
  font-weight: var(--font-weight-medium); /* 500 */
  line-height: var(--line-height-tight); /* 1.25 */
}
```

**Usage:** Navigation links, menu items
**Examples:** Sidebar navigation, tab labels, dropdown items

**Badge/Tag Text**

```css
.badge-text {
  font-size: var(--font-size-xs); /* 12px */
  font-weight: var(--font-weight-medium); /* 500 */
  line-height: var(--line-height-tight); /* 1.25 */
}
```

**Usage:** Status badges, tags, counters
**Examples:** Agent status, message counts, version badges

## 🎨 Typography Enhancement Patterns

### Emphasis & Hierarchy

**Strong Emphasis**

```css
.text-emphasis-strong {
  font-weight: var(--font-weight-semibold); /* 600 */
  color: hsl(var(--foreground));
}
```

**Usage:** Important keywords, call-outs, critical information

**Medium Emphasis**

```css
.text-emphasis-medium {
  font-weight: var(--font-weight-medium); /* 500 */
  color: hsl(var(--foreground));
}
```

**Usage:** Labels, secondary emphasis, subheadings

**Subtle Emphasis**

```css
.text-emphasis-subtle {
  font-weight: var(--font-weight-normal); /* 400 */
  color: hsl(var(--muted-foreground));
}
```

**Usage:** Helper text, secondary information, placeholders

### Status Typography

**Success Text**

```css
.text-success {
  color: hsl(var(--chart-5)); /* Green from existing chart colors */
  font-weight: var(--font-weight-medium);
}
```

**Warning Text**

```css
.text-warning {
  color: hsl(var(--chart-4)); /* Yellow from existing chart colors */
  font-weight: var(--font-weight-medium);
}
```

**Error Text**

```css
.text-error {
  color: hsl(var(--destructive)); /* Existing destructive color */
  font-weight: var(--font-weight-medium);
}
```

**Info Text**

```css
.text-info {
  color: hsl(var(--chart-2)); /* Blue from existing chart colors */
  font-weight: var(--font-weight-medium);
}
```

## 📱 Responsive Typography

### Mobile Adaptations

**Mobile Heading Scale** (using existing tokens)

```css
@media (max-width: 768px) {
  .heading-1 {
    font-size: var(--font-size-2xl); /* 24px on mobile */
  }

  .heading-2 {
    font-size: var(--font-size-xl); /* 20px on mobile */
  }

  .heading-3 {
    font-size: var(--font-size-lg); /* 18px on mobile */
  }
}
```

**Touch-Friendly Text Sizes**

```css
@media (max-width: 768px) {
  .button-text {
    font-size: var(--font-size-base); /* 16px for better touch targets */
  }

  .text-body {
    font-size: var(--font-size-base); /* Maintain readability */
    line-height: var(
      --line-height-relaxed
    ); /* 1.75 for better mobile reading */
  }
}
```

### Tablet Adaptations

**Tablet Typography** (moderate scaling)

```css
@media (min-width: 769px) and (max-width: 1024px) {
  .heading-1 {
    font-size: var(--font-size-2xl); /* 24px on tablet */
  }

  .text-large {
    font-size: var(--font-size-lg); /* 18px on tablet */
  }
}
```

## 🔍 Typography Accessibility

### Contrast & Readability

**High Contrast Combinations**

```css
/* Primary text on primary background */
.text-primary {
  color: hsl(var(--foreground));
  background-color: hsl(var(--background));
}

/* Secondary text combinations */
.text-secondary {
  color: hsl(var(--muted-foreground));
  /* Ensure sufficient contrast with background */
}
```

**Line Length & Spacing**

- Use `line-height: var(--line-height-relaxed)` for long-form content
- Use `line-height: var(--line-height-normal)` for interface elements
- Use `line-height: var(--line-height-tight)` for headings and labels

### Font Loading & Performance

**Font Display Strategy**

```css
@font-face {
  font-family: "Inter";
  font-display: swap; /* Improve perceived performance */
  /* Other font properties */
}
```

**Fallback Typography**

```css
body {
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;
}
```

## 🎯 Component-Specific Typography

### Form Typography

**Form Field Labels**

```css
.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-normal);
  color: hsl(var(--foreground));
  margin-bottom: 0.5rem;
}
```

**Input Placeholder Text**

```css
.form-input::placeholder {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  color: hsl(var(--muted-foreground));
}
```

**Help Text**

```css
.form-help {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  color: hsl(var(--muted-foreground));
  margin-top: 0.25rem;
}
```

### Card Typography

**Card Titles**

```css
.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
  color: hsl(var(--foreground));
}
```

**Card Content**

```css
.card-content {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  color: hsl(var(--muted-foreground));
}
```

### Table Typography

**Table Headers**

```css
.table-header {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
  color: hsl(var(--foreground));
}
```

**Table Data**

```css
.table-data {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  color: hsl(var(--foreground));
}
```

## 🔧 Implementation Guidelines

### Typography Utility Classes

**Size Utilities** (using existing tokens)

```css
.text-xs {
  font-size: var(--font-size-xs);
}
.text-sm {
  font-size: var(--font-size-sm);
}
.text-base {
  font-size: var(--font-size-base);
}
.text-lg {
  font-size: var(--font-size-lg);
}
.text-xl {
  font-size: var(--font-size-xl);
}
.text-2xl {
  font-size: var(--font-size-2xl);
}
.text-3xl {
  font-size: var(--font-size-3xl);
}
```

**Weight Utilities** (using existing tokens)

```css
.font-normal {
  font-weight: var(--font-weight-normal);
}
.font-medium {
  font-weight: var(--font-weight-medium);
}
.font-semibold {
  font-weight: var(--font-weight-semibold);
}
.font-bold {
  font-weight: var(--font-weight-bold);
}
```

**Line Height Utilities** (using existing tokens)

```css
.leading-tight {
  line-height: var(--line-height-tight);
}
.leading-normal {
  line-height: var(--line-height-normal);
}
.leading-relaxed {
  line-height: var(--line-height-relaxed);
}
```

### Typography Component Patterns

**Heading Component Pattern**

```tsx
// Example React component using typography tokens
function Heading({ level = 2, children, className = "" }) {
  const Tag = `h${level}`;
  const sizeClasses = {
    1: "text-3xl font-bold leading-tight",
    2: "text-2xl font-semibold leading-tight",
    3: "text-xl font-semibold leading-tight",
    4: "text-lg font-medium leading-normal",
  };

  return (
    <Tag className={`${sizeClasses[level]} text-foreground ${className}`}>
      {children}
    </Tag>
  );
}
```

**Text Component Pattern**

```tsx
// Flexible text component
function Text({
  size = "base",
  weight = "normal",
  color = "foreground",
  children,
  className = "",
}) {
  return (
    <span className={`text-${size} font-${weight} text-${color} ${className}`}>
      {children}
    </span>
  );
}
```

### Best Practices

**Typography Rules**

1. **Always use CSS custom properties** - Never hardcode font sizes
2. **Maintain semantic hierarchy** - Use tokens appropriately for content level
3. **Test across devices** - Ensure readability on all screen sizes
4. **Consider accessibility** - Provide sufficient contrast and readable font sizes

**Performance Considerations**

- Minimize font variations to reduce loading time
- Use font-display: swap for better perceived performance
- Leverage system fonts as fallbacks

---

## 🔗 Related Documentation

### **📖 Essential Context**

- **[Design System Specification](./design-system-specification.md)** - Complete design system overview **(20 min)**
- **[Color Palette Specification](./color-palette-specification.md)** - Color system for typography **(15 min)**
- **[Component Design Guidelines](./component-design-guidelines.md)** - Typography in components **(15 min)**

### **🏗️ Implementation Guides**

- **[Layout and Spacing](./layout-and-spacing.md)** - Typography spacing and layout **(10 min)**
- **[Implementation Plan](./implementation-plan.md)** - Typography implementation strategy **(15 min)**

### **🔙 Navigation**

- **[← Back to Design Documentation](./README.md)**
- **[↑ Main Documentation](../README.md)**
- **[🔍 Search & Glossary](../glossary-and-search.md)** - Find specific typography concepts

### **🎯 Next Steps**

1. **Review:** Typography scale and hierarchy
2. **Apply:** Use existing tokens for consistent typography
3. **Test:** Verify readability and accessibility across devices
4. **Document:** Comment typography choices in component code

**💡 Remember:** This typography system leverages existing design tokens to create clear hierarchy and professional communication. Consistent application across all interfaces creates a cohesive user experience.
