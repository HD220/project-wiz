# TypeScript Style Guide

## Core Principles

### Type Safety
- Use explicit types, avoid `any` at all costs
- Prefer interfaces for object shapes
- Use Zod schemas for runtime validation at IPC boundaries
- Follow strict TypeScript mode (enabled in tsconfig.json)
- Use module augmentation for global type definitions

### IPC Pattern
All IPC communication follows a standardized pattern:

```typescript
// Main process handler (src/main/ipc/[domain]/[action]/invoke.ts)
const handler = createIPCHandler({
  inputSchema: zod.schema,    // Input validation
  outputSchema: zod.schema,   // Output validation
  handler: async (input) => {
    // Business logic here
    return result;
  }
});
```

### Component Props Pattern
```typescript
// Props interfaces defined above component
interface UserProfileProps {
  userId: string;
  onUpdate?: (user: UserType) => void;
  className?: string;
}

export function UserProfile({ userId, onUpdate, className }: UserProfileProps) {
  // Component implementation
}
```

### Shared Types Organization
```typescript
// src/shared/types/[domain].types.ts
export interface UserType {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  deactivatedAt?: Date;
}

// Zod schemas for validation
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deactivatedAt: z.date().optional(),
});
```

### Error Handling Pattern
```typescript
// IPC handlers return structured results
type IPCResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

// Usage in handlers
try {
  const result = await someOperation();
  return { success: true, data: result };
} catch (error) {
  logger.error('Operation failed', { error, input });
  return { success: false, error: 'Operation failed' };
}
```

### Database Schema Pattern
```typescript
// src/main/schemas/user.schema.ts
import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  deactivatedAt: integer('deactivated_at', { mode: 'timestamp' }),
  deactivatedBy: text('deactivated_by'),
});

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
```

### React Hook Pattern
```typescript
// src/renderer/hooks/use-user.hook.ts
export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => window.api.user.get({ id: userId }),
    enabled: !!userId,
  });
}

// Custom mutations
export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: NewUser) => 
      window.api.user.create(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

### Feature Organization Pattern
```typescript
// src/renderer/features/user/index.ts (barrel export)
export { UserProfile } from './components/user-profile';
export { UserList } from './components/user-list';
export { useUser, useCreateUser } from './hooks/use-user.hook';
export { userSchema } from './user.schema';

// Usage in other files
import { UserProfile, useUser } from '@/features/user';
```

### Utility Function Pattern
```typescript
// src/shared/utils/validation.utils.ts
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

// Type-safe object keys
export function getObjectKeys<T extends Record<string, unknown>>(
  obj: T
): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}
```

### Event Bus Pattern
```typescript
// src/shared/services/event-bus.ts
interface EventMap {
  'user:created': { userId: string };
  'user:updated': { userId: string };
  'user:deleted': { userId: string };
}

export const eventBus = new EventBus<EventMap>();

// Usage
eventBus.emit('user:created', { userId: newUser.id });
eventBus.on('user:created', ({ userId }) => {
  // Handle event
});
```

## Testing Patterns

### Unit Test Pattern
```typescript
// src/renderer/components/user-profile.test.tsx
import { render, screen } from '@testing-library/react';
import { UserProfile } from './user-profile';

describe('UserProfile', () => {
  it('should display user email', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    render(<UserProfile user={mockUser} />);
    
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });
});
```

### IPC Mock Pattern
```typescript
// src/renderer/test-utils/mock-api.ts
import { vi } from 'vitest';

export const mockApi = {
  user: {
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

// In test setup
vi.mock('@/api', () => ({
  api: mockApi,
}));
```

## Important Constraints

- **Never use `any` type** - always specify proper types
- **Always validate IPC inputs** with Zod schemas
- **Use const assertions** for immutable data: `const colors = ['red', 'blue'] as const`
- **Prefer type guards** over type assertions
- **Use utility types** when appropriate: `Partial<T>`, `Pick<T, K>`, `Omit<T, K>`
- **Always handle async operations** with proper error handling