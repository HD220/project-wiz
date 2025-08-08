# Database Patterns

## Context

Database patterns and practices for project-wiz using SQLite with Drizzle ORM.

## Schema Definition Standards

### Basic Table Structure
All tables must follow this base pattern:

```typescript
// src/main/schemas/[entity].schema.ts
import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const entityTable = sqliteTable('entity_name', {
  // Primary key
  id: text('id').primaryKey(),
  
  // Business fields
  name: text('name').notNull(),
  email: text('email').unique(),
  
  // Timestamps (required for all tables)
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
    
  // Soft deletion (required for all tables)
  deactivatedAt: integer('deactivated_at', { mode: 'timestamp' }),
  deactivatedBy: text('deactivated_by'),
});

// Type exports
export type Entity = typeof entityTable.$inferSelect;
export type NewEntity = typeof entityTable.$inferInsert;
```

### Foreign Key Patterns

```typescript
// With foreign key constraint
export const userProfileTable = sqliteTable('user_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  bio: text('bio'),
  // ... timestamps and soft deletion
});

// Many-to-many relationship
export const userRolesTable = sqliteTable('user_roles', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  roleId: text('role_id')
    .notNull()
    .references(() => rolesTable.id, { onDelete: 'cascade' }),
  // ... timestamps and soft deletion
}, (table) => ({
  // Composite unique constraint
  userRoleUnique: unique().on(table.userId, table.roleId),
}));
```

### Index Patterns

```typescript
export const usersTable = sqliteTable('users', {
  // ... columns
}, (table) => ({
  // Single column index
  emailIndex: index('users_email_idx').on(table.email),
  
  // Composite index
  statusCreatedIndex: index('users_status_created_idx')
    .on(table.deactivatedAt, table.createdAt),
    
  // Unique constraint
  emailUnique: unique('users_email_unique').on(table.email),
}));
```

## Migration Workflow

### Step-by-Step Process
1. **Modify Schema**: Update schema file in `src/main/schemas/`
2. **Generate Migration**: Run `npm run db:generate`
3. **Review Migration**: Check generated SQL in `migrations/` folder
4. **Apply Migration**: Run `npm run db:migrate`
5. **Verify Changes**: Use `npm run db:studio` to inspect database

### Migration Best Practices
- Always review generated migrations before applying
- Verify migrations on sample data first
- Use descriptive migration names
- Document breaking changes in comments
- Keep migrations idempotent when possible

### Example Migration Review
```sql
-- Good: Clear column addition
ALTER TABLE users ADD COLUMN phone_number TEXT;

-- Good: Safe index creation
CREATE INDEX users_phone_idx ON users(phone_number);

-- Caution: Data loss potential
-- DROP COLUMN bio; -- Review data retention needs

-- Good: Safe constraint addition with validation
-- ALTER TABLE users ADD CONSTRAINT users_email_check 
-- CHECK (email LIKE '%@%.%');
```

## Query Patterns

### Basic CRUD Operations

```typescript
// Create
const newUser = await db.insert(usersTable)
  .values({
    id: generateId(),
    email: 'user@example.com',
    name: 'John Doe',
  })
  .returning();

// Read with soft deletion filter
const activeUsers = await db.select()
  .from(usersTable)
  .where(isNull(usersTable.deactivatedAt));

// Update with timestamp
const updatedUser = await db.update(usersTable)
  .set({
    name: 'Jane Doe',
    updatedAt: new Date(),
  })
  .where(eq(usersTable.id, userId))
  .returning();

// Soft delete
const deactivatedUser = await db.update(usersTable)
  .set({
    deactivatedAt: new Date(),
    deactivatedBy: currentUserId,
    updatedAt: new Date(),
  })
  .where(eq(usersTable.id, userId))
  .returning();
```

### Complex Queries with Joins

```typescript
// Join with soft deletion filtering
const usersWithProfiles = await db.select({
  user: usersTable,
  profile: userProfilesTable,
})
.from(usersTable)
.leftJoin(
  userProfilesTable, 
  eq(usersTable.id, userProfilesTable.userId)
)
.where(
  and(
    isNull(usersTable.deactivatedAt),
    isNull(userProfilesTable.deactivatedAt)
  )
);

// Aggregation queries
const userCounts = await db.select({
  status: sql<string>`
    CASE 
      WHEN deactivated_at IS NULL THEN 'active'
      ELSE 'inactive'
    END
  `.as('status'),
  count: count(),
})
.from(usersTable)
.groupBy(sql`
  CASE 
    WHEN deactivated_at IS NULL THEN 'active'
    ELSE 'inactive'
  END
`);
```

### Pagination Patterns

```typescript
// Cursor-based pagination (preferred for large datasets)
const getUsers = async (cursor?: string, limit = 20) => {
  const query = db.select()
    .from(usersTable)
    .where(
      and(
        isNull(usersTable.deactivatedAt),
        cursor ? gt(usersTable.createdAt, new Date(cursor)) : undefined
      )
    )
    .orderBy(asc(usersTable.createdAt))
    .limit(limit + 1); // +1 to check if there are more results

  const results = await query;
  const hasNextPage = results.length > limit;
  const items = hasNextPage ? results.slice(0, limit) : results;
  
  return {
    items,
    hasNextPage,
    nextCursor: hasNextPage 
      ? items[items.length - 1].createdAt.toISOString()
      : null,
  };
};

// Offset-based pagination (for small datasets)
const getUsersPaginated = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  
  const [items, totalCount] = await Promise.all([
    db.select()
      .from(usersTable)
      .where(isNull(usersTable.deactivatedAt))
      .limit(limit)
      .offset(offset),
    
    db.select({ count: count() })
      .from(usersTable)
      .where(isNull(usersTable.deactivatedAt)),
  ]);
  
  return {
    items,
    totalCount: totalCount[0].count,
    page,
    totalPages: Math.ceil(totalCount[0].count / limit),
  };
};
```

## Transaction Patterns

### Simple Transactions
```typescript
// Basic transaction
const result = await db.transaction(async (tx) => {
  const user = await tx.insert(usersTable)
    .values(userData)
    .returning();
  
  await tx.insert(userProfilesTable)
    .values({
      userId: user[0].id,
      bio: 'New user',
    });
    
  return user[0];
});
```

### Complex Business Logic Transactions
```typescript
// Transfer with validation
const transferCredits = async (fromUserId: string, toUserId: string, amount: number) => {
  return await db.transaction(async (tx) => {
    // Check source user balance
    const fromUser = await tx.select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.id, fromUserId),
          isNull(usersTable.deactivatedAt)
        )
      )
      .limit(1);
      
    if (!fromUser[0] || fromUser[0].credits < amount) {
      throw new Error('Insufficient credits');
    }
    
    // Update balances
    await tx.update(usersTable)
      .set({ 
        credits: sql`credits - ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, fromUserId));
      
    await tx.update(usersTable)
      .set({ 
        credits: sql`credits + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, toUserId));
    
    // Log transaction
    await tx.insert(transactionsTable)
      .values({
        fromUserId,
        toUserId,
        amount,
        type: 'transfer',
      });
      
    return { success: true };
  });
};
```

## Soft Deletion Standards

### Implementation Pattern
```typescript
// Soft delete function
export const softDelete = async (
  table: any, 
  id: string, 
  deletedBy: string
) => {
  return await db.update(table)
    .set({
      deactivatedAt: new Date(),
      deactivatedBy: deletedBy,
      updatedAt: new Date(),
    })
    .where(eq(table.id, id))
    .returning();
};

// Restore function
export const restore = async (table: any, id: string) => {
  return await db.update(table)
    .set({
      deactivatedAt: null,
      deactivatedBy: null,
      updatedAt: new Date(),
    })
    .where(eq(table.id, id))
    .returning();
};

// Active records filter helper
export const activeOnly = (table: any) => isNull(table.deactivatedAt);
```

### Query Helpers
```typescript
// Create reusable query builders
export const createActiveQuery = <T>(table: T) => {
  return db.select().from(table).where(activeOnly(table));
};

// With type safety
export const getActiveUsers = () => 
  createActiveQuery(usersTable);

export const getActiveUserById = (id: string) =>
  db.select()
    .from(usersTable)
    .where(
      and(
        eq(usersTable.id, id),
        activeOnly(usersTable)
      )
    )
    .limit(1);
```

## Performance Optimization

### Index Strategy
- Add indexes on frequently queried columns
- Composite indexes for complex WHERE clauses
- Consider partial indexes for soft deletion: `WHERE deactivated_at IS NULL`

### Query Optimization
- Use `limit()` for large result sets
- Implement proper pagination
- Use `select()` with specific columns instead of `select()*`
- Batch operations when possible

### Connection Management
- SQLite handles concurrent reads well
- Serialize writes through single connection
- Use WAL mode for better concurrent performance
- Monitor database size and implement archiving strategy

## Backup and Maintenance

### Backup Strategy
```typescript
// Simple file-based backup
const createBackup = async () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `backups/database-${timestamp}.sqlite`;
  
  // Copy database file (ensure no writes during copy)
  await fs.copyFile('database.sqlite', backupPath);
  
  return backupPath;
};
```

### Maintenance Tasks
- Regular `VACUUM` operations to reclaim space
- Monitor database size growth
- Archive old soft-deleted records
- Update statistics for query optimization