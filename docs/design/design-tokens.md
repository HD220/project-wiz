# Design Tokens

Design tokens are the fundamental definitions of visual patterns in Project Wiz. They provide a consistent visual vocabulary that ensures coherence throughout the interface.

## 📋 Overview

Design tokens are the single source of truth for all visual properties in the Project Wiz design system. They are implemented as CSS custom properties and automatically adapt to light and dark themes.

## 🎨 Color System

### **OKLCH Color Space**

Project Wiz uses the **OKLCH** color space for better visual perception and color manipulation across different themes.

### **Semantic Colors**

```css
:root {
  /* Primary Colors */
  --primary: oklch(0.21 0.006 285.885); /* Main brand blue */
  --primary-foreground: oklch(0.985 0 0); /* Text on primary */

  /* Secondary Colors */
  --secondary: oklch(0.967 0.001 286.375); /* Neutral light gray */
  --secondary-foreground: oklch(0.21 0.006 285.885); /* Text on secondary */

  /* Surface Colors */
  --background: oklch(1 0 0); /* Main background (white) */
  --foreground: oklch(0.141 0.005 285.823); /* Main text (near black) */
  --card: oklch(1 0 0); /* Card backgrounds */
  --card-foreground: oklch(0.141 0.005 285.823); /* Text on cards */

  /* Functional Colors */
  --muted: oklch(0.967 0.001 286.375); /* Less important elements */
  --muted-foreground: oklch(0.552 0.016 285.938); /* Secondary text */
  --accent: oklch(0.967 0.001 286.375); /* Subtle highlight color */
  --accent-foreground: oklch(0.21 0.006 285.885); /* Text on accent */

  /* State Colors */
  --destructive: oklch(0.577 0.245 27.325); /* Red for destructive actions */
  --destructive-foreground: oklch(0.985 0 0); /* Text on destructive */

  /* Interface Colors */
  --border: oklch(0.92 0.004 286.32); /* Subtle borders */
  --input: oklch(0.92 0.004 286.32); /* Input backgrounds */
  --ring: oklch(0.705 0.015 286.067); /* Focus ring color */
}
```

### **Dark Theme**

```css
.dark {
  /* Primary Colors */
  --primary: oklch(0.92 0.004 286.32); /* Light gray as primary */
  --primary-foreground: oklch(0.21 0.006 285.885); /* Dark text on primary */

  /* Secondary Colors */
  --secondary: oklch(0.274 0.006 286.033); /* Medium dark gray */
  --secondary-foreground: oklch(0.985 0 0); /* Light text on secondary */

  /* Surface Colors */
  --background: oklch(0.141 0.005 285.823); /* Dark main background */
  --foreground: oklch(0.985 0 0); /* Light main text */
  --card: oklch(0.21 0.006 285.885); /* Lighter card backgrounds */
  --card-foreground: oklch(0.985 0 0); /* Light text on cards */

  /* Functional Colors */
  --muted: oklch(0.274 0.006 286.033); /* Less important elements */
  --muted-foreground: oklch(0.705 0.015 286.067); /* Secondary text */
  --accent: oklch(0.274 0.006 286.033); /* Subtle highlight color */
  --accent-foreground: oklch(0.985 0 0); /* Text on accent */

  /* State Colors */
  --destructive: oklch(0.704 0.191 22.216); /* Softer red */
  --destructive-foreground: oklch(0.985 0 0); /* Text on destructive */

  /* Interface Colors */
  --border: oklch(1 0 0 / 10%); /* Transparent borders */
  --input: oklch(1 0 0 / 15%); /* Transparent inputs */
  --ring: oklch(0.552 0.016 285.938); /* Focus ring color */
}
```

### **Sidebar Colors**

```css
:root {
  /* Light Theme */
  --sidebar: oklch(0.985 0 0); /* Sidebar background */
  --sidebar-foreground: oklch(0.141 0.005 285.823); /* Sidebar text */
  --sidebar-primary: oklch(0.21 0.006 285.885); /* Sidebar primary */
  --sidebar-primary-foreground: oklch(0.985 0 0); /* Text on primary */
  --sidebar-accent: oklch(0.967 0.001 286.375); /* Sidebar accent */
  --sidebar-accent-foreground: oklch(0.21 0.006 285.885); /* Text on accent */
  --sidebar-border: oklch(0.92 0.004 286.32); /* Sidebar borders */
  --sidebar-ring: oklch(0.705 0.015 286.067); /* Focus in sidebar */
}

.dark {
  /* Dark Theme */
  --sidebar: oklch(0.21 0.006 285.885); /* Dark sidebar background */
  --sidebar-foreground: oklch(0.985 0 0); /* Light sidebar text */
  --sidebar-primary: oklch(0.488 0.243 264.376); /* Vibrant blue as primary */
  --sidebar-primary-foreground: oklch(0.985 0 0); /* Text on primary */
  --sidebar-accent: oklch(0.274 0.006 286.033); /* Dark accent */
  --sidebar-accent-foreground: oklch(0.985 0 0); /* Text on accent */
  --sidebar-border: oklch(1 0 0 / 10%); /* Transparent borders */
  --sidebar-ring: oklch(0.552 0.016 285.938); /* Focus in sidebar */
}
```

### **Chart Colors**

```css
:root {
  /* Light Theme Charts */
  --chart-1: oklch(0.646 0.222 41.116); /* Orange */
  --chart-2: oklch(0.6 0.118 184.704); /* Light blue */
  --chart-3: oklch(0.398 0.07 227.392); /* Dark blue */
  --chart-4: oklch(0.828 0.189 84.429); /* Light green */
  --chart-5: oklch(0.769 0.188 70.08); /* Green */
}

.dark {
  /* Dark Theme Charts */
  --chart-1: oklch(0.488 0.243 264.376); /* Vibrant blue */
  --chart-2: oklch(0.696 0.17 162.48); /* Aqua green */
  --chart-3: oklch(0.769 0.188 70.08); /* Green */
  --chart-4: oklch(0.627 0.265 303.9); /* Purple */
  --chart-5: oklch(0.645 0.246 16.439); /* Red */
}
```

### **Color Usage Guidelines**

#### **When to use Primary**

- Main action buttons
- Important links
- Active/selected states
- CTAs (Call to Action)

#### **When to use Secondary**

- Secondary buttons
- Less important area backgrounds
- Default component states

#### **When to use Muted**

- Supporting text
- Placeholders
- Disabled elements
- Secondary information

#### **When to use Destructive**

- Delete buttons
- Error messages
- Critical alerts
- Irreversible actions

## 📝 Typography

### **Font Stack**

```css
:root {
  --font-family-sans:
    system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  --font-family-mono:
    ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo,
    monospace;
}
```

### **Typography Scale**

```css
:root {
  /* Font Sizes */
  --text-xs: 0.75rem; /* 12px */
  --text-sm: 0.875rem; /* 14px */
  --text-base: 1rem; /* 16px */
  --text-lg: 1.125rem; /* 18px */
  --text-xl: 1.25rem; /* 20px */
  --text-2xl: 1.5rem; /* 24px */
  --text-3xl: 1.875rem; /* 30px */
  --text-4xl: 2.25rem; /* 36px */
  --text-5xl: 3rem; /* 48px */
  --text-6xl: 3.75rem; /* 60px */

  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;

  /* Font Weights */
  --font-thin: 100;
  --font-extralight: 200;
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
  --font-black: 900;
}
```

### **Text Hierarchy**

#### **Headings**

```css
/* H1 - Main page titles */
.text-h1 {
  font-size: var(--text-4xl); /* 36px */
  line-height: var(--leading-tight); /* 1.25 */
  font-weight: var(--font-bold); /* 700 */
  letter-spacing: -0.025em;
}

/* H2 - Section titles */
.text-h2 {
  font-size: var(--text-3xl); /* 30px */
  line-height: var(--leading-tight); /* 1.25 */
  font-weight: var(--font-semibold); /* 600 */
  letter-spacing: -0.025em;
}

/* H3 - Subtitles */
.text-h3 {
  font-size: var(--text-2xl); /* 24px */
  line-height: var(--leading-snug); /* 1.375 */
  font-weight: var(--font-semibold); /* 600 */
}

/* H4 - Smaller titles */
.text-h4 {
  font-size: var(--text-xl); /* 20px */
  line-height: var(--leading-snug); /* 1.375 */
  font-weight: var(--font-medium); /* 500 */
}
```

#### **Body Text**

```css
/* Main text */
.text-body {
  font-size: var(--text-base); /* 16px */
  line-height: var(--leading-normal); /* 1.5 */
  font-weight: var(--font-normal); /* 400 */
}

/* Small text */
.text-small {
  font-size: var(--text-sm); /* 14px */
  line-height: var(--leading-normal); /* 1.5 */
  font-weight: var(--font-normal); /* 400 */
}

/* Caption text */
.text-caption {
  font-size: var(--text-xs); /* 12px */
  line-height: var(--leading-normal); /* 1.5 */
  font-weight: var(--font-normal); /* 400 */
  color: oklch(var(--muted-foreground));
}
```

#### **Text Utilities**

```css
/* Code text */
.text-code {
  font-family: var(--font-family-mono);
  font-size: 0.875em;
  background: oklch(var(--muted));
  padding: 0.125rem 0.25rem;
  border-radius: calc(var(--radius) - 2px);
}

/* Lead text */
.text-lead {
  font-size: var(--text-lg); /* 18px */
  line-height: var(--leading-relaxed); /* 1.625 */
  font-weight: var(--font-normal); /* 400 */
  color: oklch(var(--muted-foreground));
}
```

## 📏 Spacing

### **8px Grid System**

```css
:root {
  /* Base unit: 8px */
  --spacing-0: 0; /* 0px */
  --spacing-1: 0.25rem; /* 4px */
  --spacing-2: 0.5rem; /* 8px */
  --spacing-3: 0.75rem; /* 12px */
  --spacing-4: 1rem; /* 16px */
  --spacing-5: 1.25rem; /* 20px */
  --spacing-6: 1.5rem; /* 24px */
  --spacing-8: 2rem; /* 32px */
  --spacing-10: 2.5rem; /* 40px */
  --spacing-12: 3rem; /* 48px */
  --spacing-16: 4rem; /* 64px */
  --spacing-20: 5rem; /* 80px */
  --spacing-24: 6rem; /* 96px */
  --spacing-32: 8rem; /* 128px */
  --spacing-40: 10rem; /* 160px */
  --spacing-48: 12rem; /* 192px */
  --spacing-56: 14rem; /* 224px */
  --spacing-64: 16rem; /* 256px */
}
```

### **Semantic Tokens**

```css
:root {
  /* Component Spacing */
  --component-padding-sm: var(--spacing-2); /* 8px */
  --component-padding-md: var(--spacing-4); /* 16px */
  --component-padding-lg: var(--spacing-6); /* 24px */

  /* Layout Spacing */
  --layout-gap-sm: var(--spacing-4); /* 16px */
  --layout-gap-md: var(--spacing-6); /* 24px */
  --layout-gap-lg: var(--spacing-8); /* 32px */

  /* Vertical Margins */
  --section-margin-sm: var(--spacing-8); /* 32px */
  --section-margin-md: var(--spacing-12); /* 48px */
  --section-margin-lg: var(--spacing-16); /* 64px */
}
```

### **Breakpoints**

```css
:root {
  /* Tailwind CSS Breakpoints */
  --breakpoint-sm: 640px; /* Small devices */
  --breakpoint-md: 768px; /* Medium devices */
  --breakpoint-lg: 1024px; /* Large devices */
  --breakpoint-xl: 1280px; /* Extra large devices */
  --breakpoint-2xl: 1536px; /* 2X large devices */
}
```

### **Spacing Usage Guidelines**

#### **Component Padding/Margin**

- **4px (spacing-1)**: Very small internal padding
- **8px (spacing-2)**: Default padding for badges, pills
- **16px (spacing-4)**: Default padding for buttons, inputs
- **24px (spacing-6)**: Padding for cards, modals

#### **Layout Gaps**

- **16px (spacing-4)**: Gap between related elements
- **24px (spacing-6)**: Gap between sections within a container
- **32px (spacing-8)**: Gap between main sections

## 🔸 Border Radius

### **Radius Tokens**

```css
:root {
  /* Base Radius */
  --radius: 0.25rem; /* 4px - configurable base value */

  /* Calculated Variations */
  --radius-sm: calc(var(--radius) - 4px); /* 0px */
  --radius-md: calc(var(--radius) - 2px); /* 2px */
  --radius-lg: var(--radius); /* 4px */
  --radius-xl: calc(var(--radius) + 4px); /* 8px */

  /* Specific Values */
  --radius-none: 0;
  --radius-full: 9999px;
}
```

### **Semantic Usage**

```css
:root {
  /* Component-Specific */
  --button-radius: var(--radius-lg); /* 4px */
  --input-radius: var(--radius-lg); /* 4px */
  --card-radius: var(--radius-xl); /* 8px */
  --badge-radius: var(--radius-full); /* Circular */
  --avatar-radius: var(--radius-full); /* Circular */
}
```

## 🌘 Shadows & Elevation

### **Elevation System**

```css
:root {
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 oklch(0 0 0 / 0.05);
  --shadow-md:
    0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.1);
  --shadow-lg:
    0 10px 15px -3px oklch(0 0 0 / 0.1), 0 4px 6px -4px oklch(0 0 0 / 0.1);
  --shadow-xl:
    0 20px 25px -5px oklch(0 0 0 / 0.1), 0 8px 10px -6px oklch(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px oklch(0 0 0 / 0.25);

  /* Context-based Elevation */
  --elevation-tooltip: var(--shadow-lg);
  --elevation-dropdown: var(--shadow-md);
  --elevation-modal: var(--shadow-2xl);
  --elevation-card: var(--shadow-sm);
}
```

### **Dark Theme Adjustments**

```css
.dark {
  /* Subtler shadows in dark theme */
  --shadow-sm: 0 1px 2px 0 oklch(0 0 0 / 0.3);
  --shadow-md:
    0 4px 6px -1px oklch(0 0 0 / 0.4), 0 2px 4px -2px oklch(0 0 0 / 0.4);
  --shadow-lg:
    0 10px 15px -3px oklch(0 0 0 / 0.4), 0 4px 6px -4px oklch(0 0 0 / 0.4);
  --shadow-xl:
    0 20px 25px -5px oklch(0 0 0 / 0.4), 0 8px 10px -6px oklch(0 0 0 / 0.4);
  --shadow-2xl: 0 25px 50px -12px oklch(0 0 0 / 0.5);
}
```

## 🎭 Opacity

### **Transparency Tokens**

```css
:root {
  /* Standard Opacities */
  --opacity-disabled: 0.38; /* Disabled elements */
  --opacity-muted: 0.6; /* Secondary elements */
  --opacity-hover: 0.8; /* Hover states */
  --opacity-active: 0.9; /* Active states */

  /* Overlays */
  --overlay-light: oklch(1 0 0 / 0.8); /* Light overlay */
  --overlay-dark: oklch(0 0 0 / 0.5); /* Dark overlay */
  --backdrop: oklch(0 0 0 / 0.8); /* Modal backdrop */
}
```

## ⚡ Transitions & Animations

### **Transition Durations**

```css
:root {
  /* Durations */
  --duration-fast: 150ms; /* Micro-interactions */
  --duration-normal: 200ms; /* Standard transitions */
  --duration-slow: 300ms; /* Complex transitions */
  --duration-slower: 500ms; /* Entry animations */

  /* Timing Functions */
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

## 🎯 Implementation Guidelines

### **How to Use Tokens**

1. **Always use custom properties instead of hardcoded values**

   ```css
   /* ✅ Correct */
   .button {
     background: oklch(var(--primary));
     padding: var(--spacing-4);
     border-radius: var(--radius-lg);
   }

   /* ❌ Incorrect */
   .button {
     background: #1a1a1a;
     padding: 16px;
     border-radius: 4px;
   }
   ```

2. **Use semantic tokens when available**

   ```css
   /* ✅ Correct */
   .card {
     padding: var(--component-padding-md);
     box-shadow: var(--elevation-card);
   }

   /* ❌ Less ideal */
   .card {
     padding: var(--spacing-4);
     box-shadow: var(--shadow-sm);
   }
   ```

3. **Maintain consistency across themes**
   ```css
   /* Tokens automatically adapt */
   .element {
     color: oklch(var(--foreground));
     background: oklch(var(--background));
   }
   ```

### **Extending Tokens**

To add new tokens, follow the convention:

```css
:root {
  /* category-property-variation */
  --color-status-success: oklch(0.7 0.15 142);
  --color-status-warning: oklch(0.8 0.15 85);
  --color-status-info: oklch(0.7 0.15 240);

  --spacing-component-gutter: var(--spacing-6);
  --radius-component-tooltip: var(--radius-md);
}
```

---

## 🔗 Related Documentation

### **Design System**

- **[Design System Overview](./README.md)** - Main design system documentation
- **[Design System Architecture](./design-system-overview.md)** - High-level system overview
- **[Visual Design Principles](./visual-design-principles.md)** - Core design philosophy
- **[Compound Components Guide](./compound-components-guide.md)** - Component creation patterns

### **External References**

- **[Tailwind CSS Documentation](https://tailwindcss.com/docs)** - CSS framework used
- **[OKLCH Color Space](https://oklch.com/)** - Color space documentation

## 📋 Implementation Checklist

When implementing new components, verify:

- [ ] Uses only design tokens (no hardcoded values)
- [ ] Works correctly in both light and dark themes
- [ ] Follows the 8px spacing system
- [ ] Uses consistent transitions
- [ ] Applies appropriate elevation/shadows
- [ ] Typography follows established hierarchy
- [ ] Colors follow semantic definitions

**💡 Remember:** Design tokens are the foundation for a consistent and scalable interface. They should be the single source of truth for all visual decisions.
