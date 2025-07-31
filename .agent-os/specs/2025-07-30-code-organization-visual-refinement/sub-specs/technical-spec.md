# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-07-30-code-organization-visual-refinement/spec.md

## Technical Requirements

### File Location Standardization

- **Feature Directory Structure**: Ensure all features follow `src/main/features/[feature]/` and `src/renderer/features/[feature]/` structure
- **Component Organization**: All components in `src/renderer/components/` with feature-specific components in feature directories
- **Shared Utilities**: Common utilities in `src/main/utils/` and `src/renderer/lib/` appropriately
- **Type Definitions**: Feature types in feature directories, shared types in appropriate locations

### Implementation Pattern Consistency

- **Main Process Flow**: `[feature].types.ts` → `[feature].model.ts` → `[feature].schema.ts` → `[feature].service.ts` → `[feature].handler.ts`
- **Renderer Process Flow**: `[feature].types.ts` → `[feature].schema.ts` → `components/` → route integration
- **Service Layer**: All business logic in services, handlers only for IPC communication
- **Data Models**: Consistent Drizzle model patterns with proper relationships and constraints

### Naming Convention Enforcement

- **Files**: kebab-case for all files (`user-profile.component.tsx`, `auth-service.ts`)
- **Components**: PascalCase with function declarations (`export function UserProfile()`)
- **Functions/Variables**: camelCase (`getUserProfile`, `isAuthenticated`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRY_COUNT`)
- **Database**: snake_case for tables/columns (`user_sessions`, `created_at`)
- **Types/Interfaces**: PascalCase (`SelectUser`, `AuthFormData`)

### Data Flow Pattern Optimization

- **Primary**: TanStack Router beforeLoad/loader for initial page data
- **Secondary**: TanStack Query for server state and mutations
- **Tertiary**: Local React state for simple UI state only
- **Prohibited**: useEffect for data loading, localStorage in renderer, useRouteContext usage
- **IPC Communication**: Consistent window.api patterns with proper typing

### Documentation Cleanup Requirements

- **Remove Legacy Comments**: Clean up outdated JWT references, old pattern comments
- **Update Code Comments**: Ensure comments explain "why" not "what"
- **Remove Dead Code**: Eliminate unused imports, functions, and variables
- **Update Type Definitions**: Clean up any 'as any' casting with proper types
- **Standardize JSDoc**: Consistent documentation format for public APIs

### Import Path Optimization

- **Absolute Imports**: Convert all relative imports to @/ paths
- **Import Organization**: Group imports (external → internal → relative)
- **Barrel Exports**: Use index.ts files for clean component exports
- **Path Mapping**: Verify tsconfig.json paths are correctly configured

### Component Pattern Consistency

- **React Components**: `export function ComponentName()` declarations only
- **Props Destructuring**: Function parameter destructuring for all props
- **No React Import**: Global React available, no import needed
- **TypeScript**: Proper prop typing without React.FC
- **Export Style**: Inline exports (`export function` not `export default`)

### Visual Design System

- **Spacing**: Consistent Tailwind spacing classes (p-4, m-2, gap-4, etc.)
- **Typography**: Standardized text classes (text-sm, font-medium, etc.)
- **Colors**: Use theme colors consistently via CSS variables
- **Component Sizing**: Consistent button sizes, input heights, card padding
- **Layout Patterns**: Standardized flex/grid patterns for common layouts

### Error Handling & Loading States

- **Loading Spinners**: Consistent loading component across all data fetching
- **Error Boundaries**: Proper error boundaries with user-friendly messages
- **Form Validation**: Consistent validation error display patterns
- **Empty States**: Standardized empty state components and messaging
- **Network Errors**: Unified error handling for API failures

### ESLint & Code Quality

- **Boundary Rules**: Strict main/renderer separation via eslint-plugin-boundaries
- **TypeScript Strict**: No 'as any', proper type definitions throughout
- **Unused Code**: Remove unused imports, variables, and functions
- **Console Statements**: Remove or replace with proper logging
- **Code Formatting**: Consistent Prettier formatting applied

### shadcn/ui Integration

- **Component Usage**: Verify all UI uses shadcn/ui base components
- **Customization Patterns**: Consistent component extension and styling
- **Theme Integration**: Proper CSS variable usage for theming
- **Accessibility**: Ensure shadcn accessibility features are maintained
