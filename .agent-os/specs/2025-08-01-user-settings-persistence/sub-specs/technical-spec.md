# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-01-user-settings-persistence/spec.md

## Current State Analysis

### Existing Settings Usage Investigation

**Frontend Settings Patterns:**
- TailwindCSS theme switching (dark/light mode)
- UI layout preferences (sidebar collapsed, panel sizes)
- User interface customizations (font size, density)
- Application behavior preferences (notifications, auto-save)

**Current Storage Investigation Required:**
- Audit React components for localStorage usage
- Identify theme management implementation
- Check for existing settings context or state management
- Document current settings structure and data types

### Database Integration Analysis

**Existing User Infrastructure:**
- User authentication system with database sessions
- User table with profile information
- Existing user-related services and handlers
- Current database transaction patterns

## Technical Requirements

### 1. Settings Audit and Discovery

**Frontend Settings Audit Tasks:**
```bash
# Search for localStorage usage in codebase
grep -r "localStorage" src/renderer/
grep -r "getItem\|setItem" src/renderer/
grep -r "theme" src/renderer/
grep -r "appearance" src/renderer/
```

**Expected Settings Categories:**
```typescript
interface UserSettingsAudit {
  appearance: {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    uiDensity: 'compact' | 'comfortable' | 'spacious';
  };
  layout: {
    sidebarCollapsed: boolean;
    panelSizes: Record<string, number>;
    windowState: 'maximized' | 'normal';
  };
  behavior: {
    notifications: boolean;
    autoSave: boolean;
    confirmBeforeDelete: boolean;
  };
}
```

### 2. Database Schema Design

**User Settings Table:**
```sql
CREATE TABLE user_settings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  category TEXT NOT NULL, -- 'appearance', 'layout', 'behavior'
  key TEXT NOT NULL,      -- Setting key within category
  value TEXT NOT NULL,    -- JSON-serialized setting value
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, category, key)
);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_user_settings_category ON user_settings(user_id, category);
```

**Alternative: Single JSON Column Approach:**
```sql
CREATE TABLE user_preferences (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  settings TEXT NOT NULL, -- Complete settings JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id)
);
```

### 3. Drizzle Model Implementation

**Settings Model (Key-Value Approach):**
```typescript
// src/main/features/user-settings/user-settings.model.ts
import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { users } from '@/main/features/user/user.model';

export const userSettings = sqliteTable('user_settings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  category: text('category').notNull(), // 'appearance', 'layout', 'behavior'
  key: text('key').notNull(),
  value: text('value').notNull(), // JSON-serialized value
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
}, (table) => ({
  userIdIdx: index('idx_user_settings_user_id').on(table.userId),
  categoryIdx: index('idx_user_settings_category').on(table.userId, table.category),
  uniqueUserSetting: unique().on(table.userId, table.category, table.key),
}));

export type SelectUserSetting = typeof userSettings.$inferSelect;
export type InsertUserSetting = typeof userSettings.$inferInsert;
```

### 4. Settings Service Implementation

**UserSettingsService:**
```typescript
// src/main/features/user-settings/user-settings.service.ts
class UserSettingsService {
  // Get all settings for a user
  async getUserSettings(userId: string): Promise<UserSettings> {
    const settings = await db.select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));
    
    return this.transformToUserSettings(settings);
  }
  
  // Get specific setting category
  async getSettingsCategory(userId: string, category: string): Promise<Record<string, any>> {
    const settings = await db.select()
      .from(userSettings)
      .where(and(
        eq(userSettings.userId, userId),
        eq(userSettings.category, category)
      ));
    
    return this.transformToObject(settings);
  }
  
  // Update single setting
  async updateSetting(userId: string, category: string, key: string, value: any): Promise<void> {
    await db.insert(userSettings)
      .values({
        userId,
        category,
        key,
        value: JSON.stringify(value),
        updatedAt: new Date().toISOString()
      })
      .onConflictDoUpdate({
        target: [userSettings.userId, userSettings.category, userSettings.key],
        set: {
          value: JSON.stringify(value),
          updatedAt: new Date().toISOString()
        }
      });
  }
  
  // Batch update settings
  async updateSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
    const updates = this.flattenSettings(settings);
    
    await db.transaction(async (tx) => {
      for (const [category, key, value] of updates) {
        await tx.insert(userSettings)
          .values({
            userId,
            category,
            key,
            value: JSON.stringify(value),
            updatedAt: new Date().toISOString()
          })
          .onConflictDoUpdate({
            target: [userSettings.userId, userSettings.category, userSettings.key],
            set: {
              value: JSON.stringify(value),
              updatedAt: new Date().toISOString()
            }
          });
      }
    });
  }
  
  private transformToUserSettings(settings: SelectUserSetting[]): UserSettings {
    // Transform flat key-value pairs back to nested object structure
  }
  
  private flattenSettings(settings: Partial<UserSettings>): Array<[string, string, any]> {
    // Flatten nested settings object to category/key/value tuples
  }
}
```

### 5. Migration Strategy

**localStorage to Database Migration:**
```typescript
// src/main/features/user-settings/settings-migration.service.ts
class SettingsMigrationService {
  async migrateUserSettingsFromLocalStorage(userId: string): Promise<void> {
    // This will be called from renderer during login/startup
    // Renderer will send localStorage data to main process for migration
    
    const migrationData = await this.getLocalStorageMigrationData();
    
    if (migrationData.hasSettings) {
      await this.performMigration(userId, migrationData.settings);
      await this.clearLocalStorageSettings(); // Optional: clear after successful migration
    }
  }
  
  private async performMigration(userId: string, localStorageSettings: any): Promise<void> {
    const mappedSettings = this.mapLocalStorageToDatabase(localStorageSettings);
    await UserSettingsService.updateSettings(userId, mappedSettings);
  }
  
  private mapLocalStorageToDatabase(localData: any): Partial<UserSettings> {
    // Map known localStorage keys to new settings structure
    return {
      appearance: {
        theme: localData.theme || 'system',
        // ... other mappings
      },
      layout: {
        sidebarCollapsed: localData.sidebarCollapsed || false,
        // ... other mappings
      }
    };
  }
}
```

### 6. IPC Handler Implementation

**Settings IPC Handlers:**
```typescript
// src/main/features/user-settings/user-settings.handler.ts
export function setupUserSettingsHandlers(): void {
  // Get all user settings
  createIpcHandler('user-settings:get', async () => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    return UserSettingsService.getUserSettings(currentUser.id);
  });
  
  // Update specific setting
  createIpcHandler('user-settings:update', async (
    category: string, 
    key: string, 
    value: any
  ) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    await UserSettingsService.updateSetting(currentUser.id, category, key, value);
  });
  
  // Batch update settings
  createIpcHandler('user-settings:batch-update', async (settings: Partial<UserSettings>) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    await UserSettingsService.updateSettings(currentUser.id, settings);
  });
  
  // Migration handler
  createIpcHandler('user-settings:migrate', async (localStorageData: any) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    await SettingsMigrationService.migrateUserSettingsFromLocalStorage(
      currentUser.id,
      localStorageData
    );
  });
}
```

### 7. Frontend Integration

**Settings Hook:**
```typescript
// src/renderer/hooks/use-user-settings.ts
export function useUserSettings() {
  const queryClient = useQueryClient();
  
  // Query user settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['user-settings'],
    queryFn: () => window.api.getUserSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: ({ category, key, value }: {
      category: string;
      key: string;
      value: any;
    }) => window.api.updateUserSetting(category, key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
  });
  
  // Batch update mutation
  const batchUpdateMutation = useMutation({
    mutationFn: (settings: Partial<UserSettings>) => 
      window.api.batchUpdateUserSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
  });
  
  return {
    settings,
    isLoading,
    updateSetting: updateSettingMutation.mutate,
    batchUpdate: batchUpdateMutation.mutate,
  };
}
```

**Migration on App Startup:**
```typescript
// src/renderer/components/app-initialization.tsx
export function AppInitialization({ children }: { children: React.ReactNode }) {
  const [migrationComplete, setMigrationComplete] = useState(false);
  
  useEffect(() => {
    async function performMigration() {
      // Check if we have localStorage settings to migrate
      const localStorageSettings = {
        theme: localStorage.getItem('theme'),
        sidebarCollapsed: localStorage.getItem('sidebarCollapsed'),
        // ... collect all relevant localStorage items
      };
      
      if (Object.values(localStorageSettings).some(v => v !== null)) {
        try {
          await window.api.migrateUserSettings(localStorageSettings);
          console.log('Settings migrated successfully');
        } catch (error) {
          console.error('Settings migration failed:', error);
        }
      }
      
      setMigrationComplete(true);
    }
    
    performMigration();
  }, []);
  
  if (!migrationComplete) {
    return <div>Initializing settings...</div>;
  }
  
  return <>{children}</>;
}
```

### 8. Testing Strategy

**Migration Testing:**
- Test migration with various localStorage configurations
- Verify data integrity during migration process
- Test fallback behavior when migration fails
- Validate settings persistence across application restarts

**Database Testing:**
- Test CRUD operations for all setting types
- Verify foreign key constraints and cascading deletes
- Test concurrent setting updates
- Validate JSON serialization/deserialization

**Integration Testing:**
- Test frontend settings updates reflect in database
- Verify settings load correctly on application startup
- Test settings behavior across different user sessions
- Validate settings synchronization between different devices/browsers