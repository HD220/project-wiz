# CSS Style Guide

We always use the latest version of TailwindCSS for all CSS styling in project-wiz.

## Multi-line CSS Classes in Markup

- We use a unique multi-line formatting style when writing Tailwind CSS classes in HTML markup and React components, where the classes for each responsive size are written on their own dedicated line.
- The top-most line should be the smallest size (no responsive prefix). Each line below it should be the next responsive size up.
- Each line of CSS classes should be aligned vertically.
- focus and hover classes should be on their own additional dedicated lines.
- We implement one additional responsive breakpoint size called 'xs' which represents 400px.
- If there are any custom CSS classes being used, those should be included at the start of the first line.

**Example of multi-line Tailwind CSS classes in React/TypeScript:**

```tsx
<div className="custom-cta bg-gray-50 dark:bg-gray-900 p-4 rounded cursor-pointer w-full
                hover:bg-gray-100 dark:hover:bg-gray-800
                focus:outline-none focus:ring-2 focus:ring-blue-500
                xs:p-6
                sm:p-8 sm:font-medium
                md:p-10 md:text-lg
                lg:p-12 lg:text-xl lg:font-semibold lg:w-3/5
                xl:p-14 xl:text-2xl
                2xl:p-16 2xl:text-3xl 2xl:font-bold 2xl:w-3/4">
  I'm a call-to-action component!
</div>
```

## Component-Specific Patterns

### shadcn/ui Integration
```tsx
// When using shadcn/ui components, maintain consistency
<Button className="w-full
                  hover:bg-primary/90
                  focus:ring-2 focus:ring-primary focus:ring-offset-2
                  sm:w-auto sm:px-8
                  md:px-12 md:text-lg
                  lg:px-16 lg:text-xl"
        variant="default"
        size="lg">
  Submit
</Button>
```

### Card Components
```tsx
<Card className="border border-gray-200 dark:border-gray-800 shadow-sm
                hover:shadow-md dark:hover:shadow-lg
                sm:rounded-lg
                md:p-6
                lg:p-8">
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

## Dark Mode Patterns

Always include dark mode variants for better user experience:

```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                border border-gray-200 dark:border-gray-700
                hover:bg-gray-50 dark:hover:bg-gray-800">
  Content with dark mode support
</div>
```

## Grid and Layout Patterns

### Responsive Grid Layouts
```tsx
<div className="grid grid-cols-1 gap-4
                sm:grid-cols-2 sm:gap-6
                md:grid-cols-3 md:gap-8
                lg:grid-cols-4 lg:gap-10
                xl:grid-cols-5">
  {/* Grid items */}
</div>
```

### Flex Layouts
```tsx
<div className="flex flex-col space-y-4
                sm:flex-row sm:space-y-0 sm:space-x-6 sm:items-center
                md:space-x-8
                lg:space-x-12">
  {/* Flex items */}
</div>
```

## Animation and Transition Classes

```tsx
<div className="transition-all duration-200 ease-in-out
                transform hover:scale-105
                opacity-0 animate-in fade-in-50
                sm:duration-300
                md:hover:scale-110">
  Animated content
</div>
```

## Form Styling Patterns

```tsx
<input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                  rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed
                  sm:text-sm
                  md:px-4 md:py-3 md:text-base
                  lg:px-5 lg:py-4"
       placeholder="Enter your text here"
       disabled={isLoading} />
```

## Spacing and Typography

### Consistent Spacing Scale
```tsx
// Use consistent spacing patterns
<div className="p-4 space-y-4
                sm:p-6 sm:space-y-6
                md:p-8 md:space-y-8
                lg:p-12 lg:space-y-12">
  <h1 className="text-xl font-semibold
                 sm:text-2xl
                 md:text-3xl md:font-bold
                 lg:text-4xl">
    Heading
  </h1>
  
  <p className="text-gray-600 dark:text-gray-300 leading-relaxed
                sm:text-lg sm:leading-relaxed
                md:text-xl md:leading-loose">
    Body text with consistent typography
  </p>
</div>
```

## Color Palette Usage

### Primary Colors (Blue)
- `bg-blue-500`, `text-blue-600`, `border-blue-300`
- `hover:bg-blue-600`, `focus:ring-blue-500`

### Secondary Colors (Gray)
- `bg-gray-100`, `text-gray-700`, `border-gray-200`
- `dark:bg-gray-800`, `dark:text-gray-300`, `dark:border-gray-700`

### Status Colors
- **Success**: `bg-green-500`, `text-green-700`, `border-green-300`
- **Warning**: `bg-yellow-500`, `text-yellow-700`, `border-yellow-300`
- **Error**: `bg-red-500`, `text-red-700`, `border-red-300`
- **Info**: `bg-blue-500`, `text-blue-700`, `border-blue-300`

## Component State Classes

### Loading States
```tsx
<div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded
                h-4 w-full
                sm:h-5
                md:h-6">
  {/* Loading skeleton */}
</div>
```

### Interactive States
```tsx
<button className="bg-primary text-primary-foreground px-4 py-2 rounded
                   hover:bg-primary/90 hover:shadow-md
                   focus:ring-2 focus:ring-primary focus:ring-offset-2
                   active:scale-95 active:shadow-sm
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary
                   transition-all duration-150 ease-in-out">
  Interactive Button
</button>
```