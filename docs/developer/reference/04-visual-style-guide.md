# Visual Style Guide

This document outlines the visual style and theming approach for Project Wiz, based on the analysis of the existing frontend codebase. The UI aims for a modern, clean look, inspired by platforms like Discord, and is implemented with a themable system supporting both light and dark modes.

## 1. Core Styling Framework

- **Tailwind CSS:** The primary styling framework is [Tailwind CSS](https://tailwindcss.com/). Utility classes are used extensively to style components directly in the markup.
- **ShadCN UI Convention:** The structure and styling of UI components (e.g., `button.tsx`, `card.tsx`, `input.tsx`) strongly suggest the use or inspiration of [ShadCN UI](https://ui.shadcn.com/). This means components are typically built using Radix UI primitives, styled with Tailwind CSS, and often use `class-variance-authority (cva)` for style variants and `clsx` or `tailwind-merge` (via a `cn` utility) for combining class names.

## 2. Theming and Color Palette

A dual-theme system (light and dark modes) is implemented using CSS Custom Properties (variables) defined in `src/infrastructure/frameworks/react/styles/globals.css`.

### 2.1. Color Definitions

Colors are defined using the `oklch()` color function for wider gamut and predictable lightness. Key color variables include:

**Common Variables (defined in `:root` for light theme, overridden in `.dark` for dark theme):**

*   `--background`: Overall page background.
*   `--foreground`: Default text color.
*   `--card`: Background color for card components.
*   `--card-foreground`: Text color for card components.
*   `--popover`: Background color for popovers.
*   `--popover-foreground`: Text color for popovers.
*   `--primary`: Primary accent color (e.g., for main buttons, active elements).
*   `--primary-foreground`: Text color for elements with `--primary` background.
*   `--secondary`: Secondary accent color (e.g., for less prominent buttons).
*   `--secondary-foreground`: Text color for elements with `--secondary` background.
*   `--muted`: Color for muted or less emphasized content.
*   `--muted-foreground`: Text color for muted content.
*   `--accent`: An accent color, often used for hover states or subtle highlights.
*   `--accent-foreground`: Text color for elements with `--accent` background.
*   `--destructive`: Color used for destructive actions (e.g., delete buttons, error states).
    *   Note: In the dark theme, `--destructive` for buttons might use a different shade (`destructive/60`) than the ring/border for destructive inputs.
*   `--border`: Default border color.
*   `--input`: Background or border color for input elements.
*   `--ring`: Color for focus rings and interactive element outlines.

**Chart Colors:**
*   `--chart-1` through `--chart-5`: A palette of distinct colors for use in charts and visualizations.

**Sidebar-Specific Colors:**
*   `--sidebar`: Background for sidebars.
*   `--sidebar-foreground`: Text color for sidebars.
*   `--sidebar-primary`: Primary accent within sidebars.
*   `--sidebar-primary-foreground`: Text color for sidebar primary elements.
*   `--sidebar-accent`: Accent color within sidebars.
*   `--sidebar-accent-foreground`: Text color for sidebar accent elements.
*   `--sidebar-border`: Border color within sidebars.
*   `--sidebar-ring`: Ring color for interactive elements within sidebars.

*(The specific `oklch()` values for light and dark themes are detailed in `globals.css` and should be referenced for exact shades.)*

### 2.2. Theme Application
The `@theme inline` block in `globals.css` maps these CSS variables for use with Tailwind utilities (e.g., `--color-background` becomes available for classes like `bg-background`).

## 3. Typography

- **Font Family:** (Assumed to be a default sans-serif stack provided by Tailwind, as no specific font family imports were prominent in `globals.css`. This should be confirmed if a specific web font is used).
- **Font Sizes:** Applied using Tailwind utility classes (e.g., `text-sm`, `text-base`, `md:text-sm`).
- **Font Weights:** Applied using Tailwind utility classes (e.g., `font-medium`, `font-semibold`).
- **Text Colors:** Primarily use `--foreground`, `--primary-foreground`, `--secondary-foreground`, `--muted-foreground`, `--accent-foreground` via Tailwind utilities.

## 4. Spacing and Sizing

- **General Spacing:** Tailwind's standard spacing scale is used for padding, margins, and gaps (e.g., `px-4`, `py-2`, `gap-2`, `gap-6`).
- **Heights/Widths:** Standard Tailwind sizing utilities (e.g., `h-9`, `w-full`) and `size-*` utilities are used.

## 5. Border Radius

- **Base Radius:** A base `--radius: 0.25rem;` is defined in `globals.css`.
- **Derived Radii:** Variations like `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl` are defined (e.g., `calc(var(--radius) - 4px)`), likely for different component sizes or emphasis. Components like buttons and cards use `rounded-md` or `rounded-xl`.

## 6. Component Styles (Examples from ShadCN UI conventions)

### 6.1. Buttons (`button.tsx`)
- **Base:** `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all`.
- **Variants (`cva`):**
    - `default`: `bg-primary text-primary-foreground shadow-xs hover:bg-primary/90`
    - `destructive`: `bg-destructive text-white shadow-xs hover:bg-destructive/90` (dark: `dark:bg-destructive/60`)
    - `outline`: `border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground` (dark: `dark:bg-input/30 dark:border-input dark:hover:bg-input/50`)
    - `secondary`: `bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80`
    - `ghost`: `hover:bg-accent hover:text-accent-foreground` (dark: `dark:hover:bg-accent/50`)
    - `link`: `text-primary underline-offset-4 hover:underline`
- **Sizes:** `default` (h-9), `sm` (h-8), `lg` (h-10), `icon` (size-9).
- **States:** Styles for `disabled`, `focus-visible`, and `aria-invalid` are defined using theme colors.

### 6.2. Cards (`card.tsx`)
- **Base:** `bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm`.
- **Header:** `grid items-start gap-1.5 px-6`.
- **Title:** `leading-none font-semibold`.
- **Description:** `text-muted-foreground text-sm`.
- **Content:** `px-6`.
- **Footer:** `flex items-center px-6`.

### 6.3. Inputs (`input.tsx`)
- **Base:** `file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none`.
- **States:** Styles for `disabled`, `focus-visible`, and `aria-invalid` are defined using theme colors.

## 7. Layout

- **General Layout:** The application appears to use a common three-column layout (main sidebar, project/context sidebar, main content area), typical of applications like Discord.
- **Flexbox and Grid:** Tailwind's flexbox and grid utilities are used extensively for component and page layouts.

## 8. Icons

- (Icon usage was not explicitly analyzed in this phase but is common in such UIs. SVG icons are often used, potentially embedded directly or via a library. The `buttonVariants` included styling for `svg` elements: `[&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0`.)

## 9. Animations
- **Accordion:** `accordion-down` and `accordion-up` keyframes are defined for accordion components.
- **General Transitions:** `transition-all` is used on buttons, and `transition-[color,box-shadow]` on inputs, indicating smooth transitions for property changes.

This style guide should be considered a living document and updated as the UI evolves. For precise color values and detailed Tailwind configurations, the source files (`globals.css`, individual component files, and potentially `tailwind.config.js` if located) should be consulted.
