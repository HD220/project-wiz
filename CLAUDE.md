# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Project Wiz** is a desktop application built with Electron that serves as an "autonomous software factory" using AI agents to automate software development workflows. The application enables collaboration between human developers and AI agents through a Discord-Like interface.

## Core Architecture

### Technology Stack

- **Electron** - Desktop application framework
- **React + TypeScript** - Frontend with strict type safety
- **Tailwind CSS** - Utility-first styling
- **Node.js** - Main process backend
- **SQLite + Drizzle ORM** - Type-safe database layer
- **TanStack Router** - File-based routing
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **Zod** - Runtime validation
- **Shadcn/ui** - Component library
- **Vitest** - Testing framework
- **AI SDK** - LLM integrations (OpenAI, DeepSeek)

### KISS Principle (Keep It Simple, Stupid)

- **Simplicity above all else** - avoid over-engineering
- **Prefer simple solutions** to complex ones
- **One responsibility per function/class**
- **Avoid premature optimization**
- **Use clear, descriptive names** that eliminate need for comments
- **Break complex problems** into smaller, manageable pieces

### Clean Code Principles

- **Code should read like prose** - readable by humans
- **Functions should be small** and do one thing well
- **Use meaningful names** for variables, functions, and classes
- **No magic numbers** - use named constants
- **Consistent formatting** - use Prettier for automatic formatting
- **Error handling** - fail fast with clear error messages
- **No commented-out code** - remove dead code completely

### Boy Scout Rule

**"Always leave the campground cleaner than you found it"**

- **When touching existing code, improve it**
- **Refactor while you work** - don't leave technical debt
- **Extract duplicated code** into reusable functions
- **Simplify complex logic** when you encounter it
- **Update outdated patterns** to current standards
- **Remove unused imports, variables, and functions**
- **Improve variable names** to be more descriptive

## Essential Commands

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
npm run test:watch
npm run test:coverage
```

### Code Quality

```bash
# Lint and fix code
npm run lint
npm run lint:fix

# Type checking
npm run type-check

# Format code
npm run format
npm run format:check

# Full quality check
npm run quality:check
```

### Database Operations

```bash
# Generate database migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Open database studio
npm run db:studio

# Reset database
npm run db:reset
```

### Utilities

```bash
# Rebuild native dependencies
npm run rebuild

# Clean build artifacts
npm run clean

# Extract i18n messages
npm run extract

# Compile i18n messages
npm run compile
```

## Development Patterns

### Code Quality Philosophy

The Project Wiz codebase follows three fundamental principles that guide all development:

#### 1. KISS in Practice

```typescript
// ❌ Over-engineered solution
class ProjectValidatorFactory {
  static createValidator(type: string): ProjectValidator {
    switch (type) {
      case "name":
        return new ProjectNameValidator();
      case "description":
        return new ProjectDescriptionValidator();
      default:
        throw new Error("Unknown validator type");
    }
  }
}

// ✅ Simple solution
const validateProjectName = (name: string): string => {
  return ProjectNameSchema.parse(name);
};
```

#### 2. Clean Code in Practice

```typescript
// ❌ Unclear and complex
function proc(d: any): boolean {
  if (d.n && d.n.length > 0) {
    if (d.s === "active") {
      return true;
    }
  }
  return false;
}

// ✅ Clear and readable
function canProjectStartWork(project: Project): boolean {
  if (!project.hasValidName()) {
    return false;
  }

  return project.isActive();
}
```

#### 3. Boy Scout Rule in Practice

```typescript
// When you find this code...
function createProject(name, desc, owner) {
  // TODO: add validation
  const proj = { name: name, description: desc, owner: owner };
  db.insert(proj);
  return proj;
}

// ...leave it better than you found it
export async function createProject(data: CreateProjectDTO): Promise<Project> {
  const validatedData = validate(CreateProjectSchema, data);

  const project = new Project(
    new ProjectIdentity(generateId()),
    ProjectAttributes.fromCreateDTO(validatedData),
  );

  const db = getDatabase();
  await db.insert(projectsSchema).values(project.toSchema());

  return project;
}
```

### Environment Setup

1. Copy `.env.example` to `.env`
2. Add required API keys:
   - `DEEPSEEK_API_KEY` - DeepSeek API key
   - `DB_FILE_NAME` - Database file name (optional)

## File Structure Rules

### TypeScript Path Aliases

```typescript
// Frontend aliases
import { Button } from "@/components/ui/button";
import { useProject } from "@/hooks/use-project";
import { ProjectService } from "@/domains/projects/services/project.service";

// Backend aliases
import { createProject } from "@/main-domains/projects/functions/create-project";
import { getDatabase } from "@/infrastructure/database";
```

## Code Quality Rules

### ESLint Configuration

The project uses comprehensive ESLint rules including:

- TypeScript strict rules
- React best practices
- Import/export organization
- Architectural boundaries enforcement

### Naming Conventions

- **Files**: `kebab-case` (e.g., `create-project.function.ts`)
- **Variables/Functions**: `camelCase`
- **Classes/Types**: `PascalCase`
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Database columns**: `snake_case`

### Import Organization

```typescript
// 1. Node.js built-ins
import { readFile } from "fs/promises";

// 2. External libraries
import { z } from "zod";
import { drizzle } from "drizzle-orm";

// 3. Internal imports (ordered by path)
import { getDatabase } from "@/infrastructure/database";
import { ProjectName } from "@/main-domains/projects/value-objects/project-name";

// 4. Relative imports
import { validateProjectData } from "./validate-project-data";
```

## Database Schema

### Drizzle ORM Usage

```typescript
// Schema definition
export const projectsSchema = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// Type inference
export type ProjectSchema = typeof projectsSchema.$inferSelect;
export type NewProjectSchema = typeof projectsSchema.$inferInsert;
```

### Migration Workflow

1. Modify schema in `src/main/persistence/schemas/`
2. Run `npm run db:generate` to create migration
3. Run `npm run db:migrate` to apply migration
4. Update entity mappings if needed

## IPC Communication

### Handler Pattern

```typescript
// Main process handler
export function setupProjectsHandlers(): void {
  ipcMain.handle("projects:create", handleCreateProject);
  ipcMain.handle("projects:findById", handleFindProjectById);
}

async function handleCreateProject(
  event: Electron.IpcMainInvokeEvent,
  data: CreateProjectDTO,
): Promise<ProjectResponse> {
  const project = await createProject(data);
  return projectToResponse(project);
}
```

### Frontend API Usage

```typescript
// Preload API definitions
const api = {
  projects: {
    create: (data: CreateProjectDTO) =>
      ipcRenderer.invoke("projects:create", data),
    findById: (id: string) => ipcRenderer.invoke("projects:findById", id),
  },
};

// React hook usage
const { mutate: createProject } = useMutation({
  mutationFn: window.api.projects.create,
});

// Tanstack router usage
```

## Internationalization

### LinguiJS Setup

```typescript
// Extract messages
npm run extract

// Compile messages
npm run compile

// Usage in components
import { Trans } from "@lingui/macro";

<Trans>{"Welcome to Project Wiz"}</Trans>


```

## Common Workflows

### Code Quality Checklist

Before committing any code, ensure you follow these quality principles:

#### KISS Checklist

- [ ] **Single Responsibility**: Each function/class has one clear purpose
- [ ] **Simple Solutions**: Chose the simplest approach that works
- [ ] **No Over-Engineering**: Avoided unnecessary abstractions
- [ ] **Clear Names**: Function and variable names are self-explanatory
- [ ] **No Premature Optimization**: Optimized only when necessary

#### Clean Code Checklist

- [ ] **Readable Code**: Code reads like well-written prose
- [ ] **Small Functions**: Functions are small and focused
- [ ] **Meaningful Names**: No abbreviations or unclear names
- [ ] **No Magic Numbers**: Used named constants
- [ ] **Error Handling**: Proper error handling with clear messages
- [ ] **No Dead Code**: Removed unused code and imports

#### Boy Scout Rule Checklist

- [ ] **Improved Existing Code**: Made surrounding code better
- [ ] **Extracted Duplicates**: Removed code duplication
- [ ] **Simplified Complex Logic**: Broke down complex functions
- [ ] **Updated Patterns**: Modernized outdated code patterns
- [ ] **Better Variable Names**: Improved naming where possible
- [ ] **Removed Technical Debt**: Fixed issues encountered

## Deployment

### Building for Production

```bash
# Extract and compile i18n messages, then build
npm run build

# Package for distribution
npm run package

# Create distributable packages
npm run make
```

### Environment Variables

Production deployments should set:

- `DEEPSEEK_API_KEY` - Required for AI functionality
- `DB_FILE_NAME` - Custom database file location (optional)

## Troubleshooting

### Common Issues

1. **Database locked errors**: Ensure no other instances are running
2. **TypeScript errors**: Run `npm run type-check` for detailed errors
3. **IPC communication failures**: Check handler registration in main process
4. **Build failures**: Clear cache with `npm run clean`

### Development Tips

- Use `npm run dev` for hot reloading
- Use `npm run test:watch` for continuous testing
- Use `npm run db:studio` for database inspection
- Check ESLint output for architectural violations
