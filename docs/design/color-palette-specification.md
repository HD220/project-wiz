# Color Palette Specification

This document defines the complete color system for Project Wiz based on the existing OKLCH design tokens in globals.css, providing semantic meanings and usage guidelines for creating a cohesive visual experience.

## 🎨 Color Philosophy

### Design Approach

**Existing Token Optimization**

- Leverage current OKLCH color space for superior color accuracy
- Work within established token structure without modifications
- Enhance semantic meaning and usage patterns
- Create visual hierarchy through strategic color application

**Professional AI Platform Aesthetic**

- Sophisticated color relationships that convey technical expertise
- Subtle gradients and color variations for visual depth
- High contrast accessibility compliance
- Modern, professional appearance suitable for enterprise use

## 🌈 Current Color System Analysis

### Light Theme Colors

**Background & Surface Hierarchy**

```css
/* Primary Surfaces */
--background: oklch(1 0 0); /* Pure White - Main background */
--card: oklch(1 0 0); /* Pure White - Card background */
--popover: oklch(1 0 0); /* Pure White - Overlay background */

/* Elevated Surfaces */
--sidebar: oklch(0.985 0 0); /* Off White - Sidebar background */
--secondary: oklch(0.967 0.001 286.375); /* Light Gray - Secondary elements */
--muted: oklch(0.967 0.001 286.375); /* Light Gray - Muted background */
--accent: oklch(0.967 0.001 286.375); /* Light Gray - Accent background */
```

**Text & Content Colors**

```css
/* Primary Text */
--foreground: oklch(0.141 0.005 285.823); /* Dark Gray - Primary text */
--card-foreground: oklch(0.141 0.005 285.823); /* Dark Gray - Card text */
--popover-foreground: oklch(0.141 0.005 285.823); /* Dark Gray - Popover text */

/* Secondary Text */
--muted-foreground: oklch(
  0.552 0.016 285.938
); /* Medium Gray - Secondary text */
--sidebar-foreground: oklch(0.141 0.005 285.823); /* Dark Gray - Sidebar text */
```

**Interactive & Brand Colors**

```css
/* Primary Brand */
--primary: oklch(0.21 0.006 285.885); /* Dark Purple - Primary actions */
--primary-foreground: oklch(0.985 0 0); /* White - Text on primary */

/* Sidebar Specific */
--sidebar-primary: oklch(
  0.21 0.006 285.885
); /* Dark Purple - Sidebar primary */
--sidebar-accent: oklch(0.967 0.001 286.375); /* Light Gray - Sidebar accent */
```

**Status & Feedback Colors**

```css
/* Error States */
--destructive: oklch(0.577 0.245 27.325); /* Red - Error/destructive actions */

/* Chart & Data Visualization */
--chart-1: oklch(0.646 0.222 41.116); /* Orange - Chart color 1 */
--chart-2: oklch(0.6 0.118 184.704); /* Blue - Chart color 2 */
--chart-3: oklch(0.398 0.07 227.392); /* Dark Blue - Chart color 3 */
--chart-4: oklch(0.828 0.189 84.429); /* Yellow - Chart color 4 */
--chart-5: oklch(0.769 0.188 70.08); /* Green - Chart color 5 */
```

**Border & Input Colors**

```css
/* Borders & Separators */
--border: oklch(0.92 0.004 286.32); /* Light Gray - Borders */
--input: oklch(0.92 0.004 286.32); /* Light Gray - Input borders */
--sidebar-border: oklch(0.92 0.004 286.32); /* Light Gray - Sidebar borders */

/* Focus & Selection */
--ring: oklch(0.705 0.015 286.067); /* Medium Gray - Focus rings */
--sidebar-ring: oklch(0.705 0.015 286.067); /* Medium Gray - Sidebar focus */
```

### Dark Theme Colors

**Background & Surface Hierarchy**

```css
/* Primary Surfaces */
--background: oklch(
  0.141 0.005 285.823
); /* Dark Background - Main background */
--card: oklch(0.21 0.006 285.885); /* Medium Dark - Card background */
--popover: oklch(0.21 0.006 285.885); /* Medium Dark - Overlay background */

/* Elevated Surfaces */
--sidebar: oklch(0.21 0.006 285.885); /* Medium Dark - Sidebar background */
--secondary: oklch(0.274 0.006 286.033); /* Lighter Dark - Secondary elements */
--muted: oklch(0.274 0.006 286.033); /* Lighter Dark - Muted background */
--accent: oklch(0.274 0.006 286.033); /* Lighter Dark - Accent background */
```

**Text & Content Colors**

```css
/* Primary Text */
--foreground: oklch(0.985 0 0); /* White - Primary text */
--card-foreground: oklch(0.985 0 0); /* White - Card text */
--popover-foreground: oklch(0.985 0 0); /* White - Popover text */

/* Secondary Text */
--muted-foreground: oklch(
  0.705 0.015 286.067
); /* Light Gray - Secondary text */
--sidebar-foreground: oklch(0.985 0 0); /* White - Sidebar text */
```

**Interactive & Brand Colors**

```css
/* Primary Brand */
--primary: oklch(0.92 0.004 286.32); /* Light Gray - Primary actions */
--primary-foreground: oklch(0.21 0.006 285.885); /* Dark - Text on primary */

/* Sidebar Specific */
--sidebar-primary: oklch(0.488 0.243 264.376); /* Purple - Sidebar primary */
--sidebar-accent: oklch(
  0.274 0.006 286.033
); /* Lighter Dark - Sidebar accent */
```

**Status & Feedback Colors**

```css
/* Error States */
--destructive: oklch(
  0.704 0.191 22.216
); /* Bright Red - Error/destructive actions */

/* Chart & Data Visualization */
--chart-1: oklch(0.488 0.243 264.376); /* Purple - Chart color 1 */
--chart-2: oklch(0.696 0.17 162.48); /* Teal - Chart color 2 */
--chart-3: oklch(0.769 0.188 70.08); /* Green - Chart color 3 */
--chart-4: oklch(0.627 0.265 303.9); /* Pink - Chart color 4 */
--chart-5: oklch(0.645 0.246 16.439); /* Orange - Chart color 5 */
```

**Border & Input Colors**

```css
/* Borders & Separators */
--border: oklch(1 0 0 / 10%); /* Transparent White - Borders */
--input: oklch(1 0 0 / 15%); /* Transparent White - Input borders */
--sidebar-border: oklch(1 0 0 / 10%); /* Transparent White - Sidebar borders */

/* Focus & Selection */
--ring: oklch(0.552 0.016 285.938); /* Medium Gray - Focus rings */
--sidebar-ring: oklch(0.552 0.016 285.938); /* Medium Gray - Sidebar focus */
```

## 🎯 Semantic Color Usage

### Primary Actions & Navigation

**Button Hierarchies**

- **Primary Buttons**: Use `--primary` background with `--primary-foreground` text
- **Secondary Buttons**: Use `--secondary` background with `--secondary-foreground` text
- **Ghost Buttons**: Use transparent background with `--foreground` text
- **Destructive Buttons**: Use `--destructive` background with white text

**Navigation Elements**

- **Active States**: Use `--sidebar-primary` for active navigation items
- **Hover States**: Use `--sidebar-accent` for hover backgrounds
- **Focus States**: Use `--ring` color for focus indicators

### Status Communication

**Agent Status Indicators**

```css
/* Using existing chart colors for status */
.agent-status-active {
  color: var(--chart-5);
} /* Green - Ready/Active */
.agent-status-busy {
  color: var(--chart-4);
} /* Yellow - Working */
.agent-status-error {
  color: var(--destructive);
} /* Red - Error state */
.agent-status-idle {
  color: var(--chart-2);
} /* Blue - Idle */
.agent-status-offline {
  color: var(--muted-foreground);
} /* Gray - Offline */
```

**Feedback Messages**

- **Success**: Use `--chart-5` (green) for success states
- **Warning**: Use `--chart-4` (yellow) for warnings
- **Error**: Use `--destructive` for error states
- **Info**: Use `--chart-2` (blue) for informational messages

### Content Hierarchy

**Text Importance Levels**

- **Primary Content**: Use `--foreground` for main content
- **Secondary Content**: Use `--muted-foreground` for supporting text
- **Placeholder Text**: Use `--muted-foreground` with reduced opacity
- **Disabled Text**: Use `--muted-foreground` with 50% opacity

**Background Hierarchy**

- **Page Background**: Use `--background` for main page areas
- **Card Surfaces**: Use `--card` for content cards
- **Elevated Elements**: Use `--popover` for modals and dropdowns
- **Sidebar Areas**: Use `--sidebar` for navigation panels

## 🎨 Visual Enhancement Strategies

### Depth & Elevation

**Surface Layering** (using existing tokens)

1. **Base Layer**: `--background` - Main page background
2. **Content Layer**: `--card` - Primary content areas
3. **Interactive Layer**: `--popover` - Buttons, inputs, interactive elements
4. **Elevated Layer**: `--sidebar` - Modals, dropdowns, tooltips

**Shadow Integration**

- Combine existing shadows with semantic colors
- Use `--primary` color for primary action shadows
- Use `--destructive` color for warning/error shadows
- Use neutral colors for general elevation

### Brand Expression

**Primary Brand Moments**

- Use `--sidebar-primary` (purple in dark mode) for key brand touchpoints
- Apply to primary CTAs, active states, and brand elements
- Maintain consistent application across light and dark themes

**Secondary Brand Support**

- Use chart colors strategically for brand support
- Create visual rhythm through consistent color application
- Balance brand expression with functional clarity

### Accessibility Enhancements

**Contrast Optimization**

- Current tokens already provide WCAG AA compliance
- Use high contrast pairings: `--foreground` on `--background`
- Maintain readability with `--muted-foreground` on light backgrounds

**Color-Blind Considerations**

- Existing chart colors provide good separation for color-blind users
- Combine color with icons/shapes for status communication
- Test color combinations with accessibility tools

## 🔧 Implementation Guidelines

### Color Application Patterns

**Component Color Mapping**

```css
/* Button variants using existing tokens */
.btn-primary {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.btn-secondary {
  background-color: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
}

.btn-destructive {
  background-color: hsl(var(--destructive));
  color: hsl(var(--primary-foreground));
}
```

**Status Component Patterns**

```css
/* Agent status using chart colors */
.status-indicator.active {
  background-color: hsl(var(--chart-5));
}

.status-indicator.busy {
  background-color: hsl(var(--chart-4));
}

.status-indicator.error {
  background-color: hsl(var(--destructive));
}

.status-indicator.idle {
  background-color: hsl(var(--chart-2));
}
```

### Theme Consistency Rules

**Token Usage Principles**

1. **Always use CSS custom properties** - Never hardcode color values
2. **Respect semantic meaning** - Use tokens for their intended purpose
3. **Maintain theme compatibility** - Ensure colors work in both light and dark modes
4. **Test accessibility** - Verify contrast ratios meet WCAG standards

**Component Development**

- Use `hsl()` wrapper function for all color applications
- Test components in both light and dark themes
- Document color choices in component comments
- Follow established patterns for consistency

## 🎨 Advanced Color Techniques

### Gradient Applications

**Using Existing Colors**

```css
/* Primary gradient using existing tokens */
.gradient-primary {
  background: linear-gradient(
    135deg,
    hsl(var(--primary)),
    hsl(var(--sidebar-primary))
  );
}

/* Chart gradient using chart colors */
.gradient-chart {
  background: linear-gradient(
    90deg,
    hsl(var(--chart-1)),
    hsl(var(--chart-2)),
    hsl(var(--chart-3))
  );
}
```

### Opacity Variations

**Creating Color Variations**

```css
/* Subtle backgrounds using existing colors with opacity */
.bg-primary-subtle {
  background-color: hsl(var(--primary) / 0.1);
}

.bg-success-subtle {
  background-color: hsl(var(--chart-5) / 0.1);
}

.bg-warning-subtle {
  background-color: hsl(var(--chart-4) / 0.1);
}
```

### Hover & Interactive States

**State Variations** (without new tokens)

```css
/* Create hover states using existing colors */
.interactive-primary:hover {
  background-color: hsl(var(--primary) / 0.9);
}

.interactive-secondary:hover {
  background-color: hsl(var(--secondary) / 0.8);
}
```

---

## 🔗 Related Documentation

### **📖 Essential Context**

- **[Component Design Guidelines](./component-design-guidelines.md)** - Complete component implementation guide **(25 min)**
- **[Typography System](./typography-system.md)** - Typography implementation using existing tokens **(10 min)**
- **[Component Design Guidelines](./component-design-guidelines.md)** - Visual component patterns **(15 min)**

### **🏗️ Implementation Guides**

- **[Layout and Spacing](./layout-and-spacing.md)** - Spacing system using existing tokens **(10 min)**
- **[Implementation Plan](./implementation-plan.md)** - Detailed execution strategy **(15 min)**

### **🔙 Navigation**

- **[← Back to Design Documentation](./README.md)**
- **[↑ Main Documentation](../README.md)**
- **[🔍 Search & Glossary](../glossary-and-search.md)** - Find specific color concepts

### **🎯 Next Steps**

1. **Understand:** Current color system and token structure
2. **Apply:** Use existing tokens for consistent visual design
3. **Enhance:** Create visual depth through strategic color application
4. **Test:** Verify accessibility and theme compatibility

**💡 Remember:** This color system leverages existing design tokens to create a cohesive, professional visual experience. Consistency in application is key to achieving the desired visual impact.
