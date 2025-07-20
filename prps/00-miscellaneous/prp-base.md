# Purpose

Template optimized for AI agents to implement features with sufficient context and self-validation capabilities to achieve working code through iterative refinement.

## Core Principles

1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance

---

## Goal

[What needs to be built - be specific about the end state and desires]

## Why

- [Business value and user impact]
- [Integration with existing features]
- [Problems this solves and for whom]

## What

[User-visible behavior and technical requirements]

### Success Criteria

- [ ] [Specific measurable outcomes]

## All Needed Context

### Documentation & References (list all context needed to implement the feature)

```yaml
# MUST READ - Include these in your context window
- url: [Official Next.js/React docs URL]
  why: [Specific sections/methods you'll need]

- file: [path/to/example.tsx]
  why: [Pattern to follow, gotchas to avoid]

- doc: [Library documentation URL]
  section: [Specific section about common pitfalls]
  critical: [Key insight that prevents common errors]

- docfile: [PRPs/ai_docs/file.md]
  why: [docs that the user has pasted in to the project]
```

### Current Codebase tree (run `tree` in the root of the project) to get an overview of the codebase

```bash

```

### Desired Codebase tree with files to be added and responsibility of file

```bash

```

### Known Gotchas of our codebase & Library Quirks

```typescript
// CRITICAL: [Library name] requires [specific setup]
// Example: Next.js 15 App Router - Route handlers must export named functions
// Example: 'use client' directive must be at top of file, affects entire component tree
// Example: Server Components can't use browser APIs or event handlers
// Example: We use TypeScript strict mode and require proper typing
```

## Implementation Blueprint

### Data models and structure

Create the core data models, we ensure type safety and consistency.

```typescript
Examples:
 - Zod schemas for validation
 - TypeScript interfaces/types
 - Database schema types
 - API response types
 - Component prop types

```

### Integration Points

```yaml
DATABASE:
  - migration: "Add table 'feature_data' with proper indexes"
  - client: "@/lib/database/client"
  - pattern: "createClient() for client components, createServerClient() for server components"

CONFIG:
  - add to: .env.local
  - pattern: "NEXT_PUBLIC_* for client-side env vars"
  - pattern: "FEATURE_TIMEOUT = process.env.FEATURE_TIMEOUT || '30000'"

ROUTES:
  - file structure: app/feature-name/page.tsx
  - api routes: app/api/feature-name/route.ts
  - middleware: middleware.ts (root level)
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
npm run lint                    # ESLint checks
npx tsc --noEmit               # TypeScript type checking
npm run format                 # Prettier formatting

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Unit Tests each new feature/file/function use existing test patterns

```typescript
// CREATE __tests__/new-feature.test.tsx with these test cases:
import { render, screen } from '@testing-library/react'
import { NewFeature } from '@/components/new-feature'

describe('NewFeature', () => {
  test('renders without crashing', () => {
    render(<NewFeature />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  test('handles invalid input gracefully', () => {
    render(<NewFeature invalidProp="" />)
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })

  test('calls API with correct parameters', async () => {
    const mockFetch = jest.fn()
    global.fetch = mockFetch

    render(<NewFeature />)
    // ... test API interaction
  })
})
```

```bash
# Run and iterate until passing:
npm test new-feature.test.tsx
# If failing: Read error, understand root cause, fix code, re-run (never mock to pass)
```

### Level 3: Integration Test

```bash
# Start the dev server
npm run dev

# Test the page loads
curl http://localhost:3000/dashboard/users
# Expected: HTML response with user table

# Test the API endpoint
curl -X POST http://localhost:3000/api/feature \
  -H "Content-Type: application/json" \
  -d '{"param": "test_value"}'

# Expected: {"status": "success", "data": {...}}
# If error: Check browser console and Next.js terminal for error messages
```

### Level 4: Deployment & Creative Validation

```bash
# Production build check
npm run build

# Expected: Successful build with no errors
# Common issues:
# - "Module not found" → Check import paths
# - "Hydration mismatch" → Ensure server/client render same content
# - Type errors → Run tsc to identify

# Test production build
npm run start

# Creative validation methods:
# - E2E testing with Playwright/Cypress
# - Performance testing with Lighthouse
# - Accessibility testing with axe
# - Bundle size analysis
# - SEO validation

# Custom validation specific to the feature
# [Add creative validation methods here]
```

## Final validation Checklist

- [ ] All tests pass: `npm test`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npx tsc --noEmit`
- [ ] Manual test successful: [specific curl/command]
- [ ] Error cases handled gracefully
- [ ] Logs are informative but not verbose
- [ ] Documentation updated if needed

---

## Anti-Patterns to Avoid

- ❌ Don't create new patterns when existing ones work
- ❌ Don't skip validation because "it should work"
- ❌ Don't ignore failing tests - fix them
- ❌ Don't use 'use client' unnecessarily - embrace Server Components
- ❌ Don't hardcode values that should be config
- ❌ Don't catch all exceptions - be specific
