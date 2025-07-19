# Task: Create LLM Provider Service Layer

## Meta Information

```yaml
id: TASK-003
title: Create LLM Provider Service Layer with Encryption
source_document: prps/sistema-agentes-ai/README.md
priority: high
estimated_effort: 3 hours
dependencies: [TASK-001, TASK-002]
tech_stack: [TypeScript, Drizzle ORM, Node.js Crypto, SQLite]
domain_context: llm/provider-service
project_type: desktop
```

## Primary Goal

**Create a service layer for managing LLM provider credentials with secure API key encryption/decryption, following existing project service patterns for database operations and error handling**

### Success Criteria
- [ ] ProviderService class with CRUD operations implemented
- [ ] API key encryption/decryption using Node.js crypto module
- [ ] Service follows existing project patterns from AuthService
- [ ] Error handling consistent with project conventions
- [ ] Database operations use established Drizzle patterns
- [ ] Provider validation and testing capabilities included
- [ ] All service methods return data directly (no IPC wrapping)

## Complete Context

### Project Architecture Context
```
src/main/
├── llm/                        # CURRENT DOMAIN
│   ├── providers.schema.ts     # DEPENDENCY - Schema definitions
│   ├── provider.service.ts     # THIS TASK - Service implementation
│   └── provider.handlers.ts    # FUTURE - IPC handlers
├── user/                       # REFERENCE PATTERNS
│   └── authentication/
│       └── auth.service.ts     # Pattern source for service structure
├── database/
│   └── connection.ts           # getDatabase() utility
└── main.ts                     # Handler registration (future)
```

### Technology-Specific Context
```yaml
database:
  type: SQLite
  orm_framework: Drizzle ORM
  schema_location: src/main/llm/providers.schema.ts
  migration_command: npm run db:migrate

backend:
  framework: Electron Main Process
  language: TypeScript
  api_pattern: Service layer returns data, handlers wrap IPC
  auth_method: Simple in-memory session

security:
  encryption: Node.js built-in crypto module
  key_storage: Environment variable or secure generation
  algorithm: AES-256-GCM for API key encryption

testing:
  unit_framework: Vitest
  test_command: npm test
  
build_tools:
  package_manager: npm
  linter: ESLint
  formatter: Prettier
  type_checker: TypeScript
```

### Existing Code Patterns
```typescript
// Pattern 1: Service Class Structure (from AuthService)
export class AuthService {
  static async methodName(input: InputType): Promise<OutputType> {
    const db = getDatabase();
    
    // Business logic and validation
    const [result] = await db.insert(table).values(input).returning();
    
    if (!result) {
      throw new Error("Operation failed");
    }
    
    return result; // Return data directly
  }
}

// Pattern 2: Database Operations (from AuthService)
const [user] = await db
  .select()
  .from(usersTable)
  .where(eq(usersTable.id, userId))
  .limit(1);

// Pattern 3: Error Handling
if (!existingRecord) {
  throw new Error("Descriptive error message");
}

// Pattern 4: Private Utility Methods
private static async utilityMethod(input: string): Promise<string> {
  // Implementation
}
```

### Project-Specific Conventions
```yaml
naming_conventions:
  files: kebab-case
  variables: camelCase
  constants: SCREAMING_SNAKE_CASE
  classes: PascalCase
  methods: camelCase

import_organization:
  - Node.js built-ins (crypto)
  - External libraries (drizzle-orm)
  - Internal modules with @/ alias
  - Relative imports for same domain

error_handling:
  pattern: Throw errors with descriptive messages
  logging: Use existing logger utility
  validation: Service layer validates input
```

### Validation Commands
```bash
npm run type-check      # TypeScript type checking
npm run lint           # ESLint checks
npm run format         # Prettier formatting
npm test              # Run unit tests
npm run dev           # Start development for integration testing
```

## Implementation Steps

### Phase 1: Service Foundation
```
CREATE src/main/llm/provider.service.ts:
  - FOLLOW_PATTERN: src/main/user/authentication/auth.service.ts
  - SETUP_IMPORTS:
    • Import crypto from Node.js for encryption
    • Import Drizzle ORM utilities (eq, and, or)
    • Import getDatabase from @/main/database/connection
    • Import schema types from ./providers.schema
    • Import logger if available
  
  - DEFINE_INTERFACES:
    • CreateProviderInput (extends InsertLlmProvider)
    • UpdateProviderInput (Partial with id)
    • DecryptedProvider (SelectLlmProvider with decrypted apiKey)
  
  - VALIDATE: npm run type-check
  - IF_FAIL: Check import paths and type definitions
```

### Phase 2: Encryption System
```
IMPLEMENT_ENCRYPTION_METHODS:
  - CREATE_PRIVATE_METHODS:
    • generateEncryptionKey(): Create or retrieve encryption key
    • encryptApiKey(apiKey: string): Promise<string>
    • decryptApiKey(encryptedKey: string): Promise<string>
    • validateProvider(input: any): Validate provider configuration
  
  - ENCRYPTION_ALGORITHM:
    • Use AES-256-GCM for authenticated encryption
    • Store initialization vector with encrypted data
    • Handle encryption errors gracefully
    • Generate secure encryption key if not exists
  
  - VALIDATE: npm run type-check
  - IF_FAIL: Check crypto module usage and async patterns
```

### Phase 3: CRUD Operations
```
IMPLEMENT_SERVICE_METHODS:
  - CREATE_METHOD:
    • Validate input data
    • Check for existing provider with same name/user
    • Encrypt API key before storage
    • Insert with returning() pattern
    • Handle default provider logic
  
  - READ_METHODS:
    • findById(id: string): Get single provider
    • findByUserId(userId: string): Get user's providers
    • getDefault(userId: string): Get user's default provider
    • getDecrypted(id: string): Get provider with decrypted API key
  
  - UPDATE_METHOD:
    • Validate update input
    • Handle API key re-encryption if changed
    • Update default provider logic if needed
    • Return updated provider
  
  - DELETE_METHOD:
    • Check for agent dependencies
    • Handle default provider reassignment
    • Soft delete or hard delete as appropriate
  
  - VALIDATE: npm run type-check
  - IF_FAIL: Check database query patterns and error handling
```

### Phase 4: Business Logic
```
IMPLEMENT_BUSINESS_LOGIC:
  - PROVIDER_VALIDATION:
    • Validate provider type against supported types
    • Test API connectivity if possible
    • Validate API key format for each provider type
    • Check baseUrl format if provided
  
  - DEFAULT_MANAGEMENT:
    • Ensure only one default provider per user
    • Auto-set first provider as default
    • Handle default transfer on deletion
  
  - SECURITY_MEASURES:
    • Never log decrypted API keys
    • Validate user ownership before operations
    • Sanitize error messages to avoid key exposure
  
  - VALIDATE: npm test
  - IF_FAIL: Add test cases and fix validation logic
```

## Validation Checkpoints

### Checkpoint 1: Service Structure
```
VALIDATE_SERVICE_STRUCTURE:
  - RUN: npm run type-check
  - EXPECT: No TypeScript errors in service file
  - CHECK: All imports resolved correctly
  - CHECK: Service class follows established patterns
  - CHECK: Method signatures match interface definitions
```

### Checkpoint 2: Encryption System
```
VALIDATE_ENCRYPTION:
  - TEST_ENCRYPTION:
    • Create test API key
    • Encrypt using encryptApiKey method
    • Decrypt using decryptApiKey method
    • Verify original matches decrypted value
  
  - TEST_ERROR_HANDLING:
    • Test with invalid encrypted data
    • Test with missing encryption key
    • Verify graceful error handling
```

### Checkpoint 3: Database Operations
```
VALIDATE_DATABASE_OPS:
  - RUN: npm test
  - TEST_CREATE:
    • Create provider with valid input
    • Verify API key is encrypted in database
    • Test duplicate name/user validation
  
  - TEST_READ:
    • Retrieve provider by ID
    • Retrieve providers by user ID
    • Test decrypted provider retrieval
  
  - TEST_UPDATE:
    • Update provider configuration
    • Update API key and verify re-encryption
    • Test default provider changes
  
  - TEST_DELETE:
    • Delete provider successfully
    • Test constraint handling
```

### Checkpoint 4: Integration Testing
```
VALIDATE_INTEGRATION:
  - START: npm run dev
  - TEST_FULL_WORKFLOW:
    • Create user (use existing auth system)
    • Create multiple providers for user
    • Set default provider
    • Update provider configuration
    • Delete non-default provider
    • Verify data consistency
```

## Use Cases & Examples

### Example Data/Input
```typescript
// Example provider creation input
const createProviderInput: CreateProviderInput = {
  userId: "user-123-uuid",
  name: "My OpenAI Provider",
  type: "openai",
  apiKey: "sk-1234567890abcdef", // Will be encrypted
  baseUrl: "https://api.openai.com/v1",
  isDefault: true,
  isActive: true
};

// Example provider update input
const updateProviderInput: UpdateProviderInput = {
  id: "provider-456-uuid",
  name: "Updated Provider Name",
  apiKey: "sk-new-api-key", // Will be re-encrypted
  isDefault: false
};

// Example encrypted storage (internal)
const encryptedProvider = {
  ...createProviderInput,
  apiKey: "encrypted:iv:data", // Encrypted format
  createdAt: new Date(),
  updatedAt: new Date()
};
```

### Common Scenarios
1. **First Provider Setup**: User creates their first LLM provider (auto-default)
2. **Multiple Providers**: User adds DeepSeek, Anthropic providers
3. **Key Rotation**: User updates API key due to expiration
4. **Provider Testing**: Validate provider credentials before saving
5. **Default Management**: User changes default provider

### Business Rules & Constraints
- **Single Default**: Only one provider per user can be default
- **Unique Names**: Provider names must be unique per user
- **API Key Security**: Keys always encrypted at rest
- **User Ownership**: Users can only access their own providers
- **Active Providers**: Only active providers available for agent use

### Edge Cases & Error Scenarios
- **Invalid API Key**: Service validates key format and connectivity
- **Encryption Failure**: Graceful handling of crypto errors
- **Default Conflicts**: Automatic resolution of default provider conflicts
- **Provider Dependencies**: Check agent usage before deletion
- **Malformed baseUrl**: Validation of custom endpoint URLs

## Troubleshooting Guide

### Common Issues by Technology

#### Encryption Issues
```
PROBLEM: Crypto module not found
SOLUTION: 
  - Verify Node.js crypto module import: import crypto from 'crypto'
  - Check Electron nodeIntegration settings
  - Ensure main process has access to Node.js APIs

PROBLEM: Encryption/decryption failures
SOLUTION:
  - Verify AES-256-GCM algorithm parameters
  - Check initialization vector handling
  - Ensure consistent encoding (base64/hex)
  - Validate encryption key generation
```

#### Database Operation Issues
```
PROBLEM: Foreign key constraint errors
SOLUTION:
  - Verify userId exists in users table
  - Check user authentication state
  - Validate user ownership in service methods

PROBLEM: Unique constraint violations
SOLUTION:
  - Check for existing provider names per user
  - Implement proper duplicate validation
  - Handle update vs create scenarios
```

#### Service Logic Issues
```
PROBLEM: Default provider logic errors
SOLUTION:
  - Implement atomic default provider updates
  - Use database transactions for consistency
  - Handle concurrent default changes

PROBLEM: API key validation failures
SOLUTION:
  - Implement provider-specific key format validation
  - Add optional API connectivity testing
  - Provide clear validation error messages
```

### Debug Commands
```bash
# Service testing
npm test provider.service.test.ts    # Specific service tests
npm run type-check --verbose         # Detailed type errors

# Encryption debugging
node -e "console.log(require('crypto').constants)"  # Crypto constants
node -e "const c=require('crypto'); console.log(c.getCiphers())"  # Available ciphers

# Database debugging
npm run db:studio                    # Visual provider inspection
sqlite3 project-wiz.db "SELECT name, type, isDefault FROM llm_providers"
```

## Dependencies & Prerequisites

### Required Files/Components
- [ ] `TASK-001`: LLM providers schema must exist
- [ ] `src/main/database/connection.ts`: Database connection utility
- [ ] `src/main/user/authentication/auth.service.ts`: Pattern reference
- [ ] Node.js crypto module availability in Electron main process

### Required Patterns/Conventions
- [ ] Service class with static methods pattern
- [ ] Database operations using getDatabase() and Drizzle
- [ ] Error handling with descriptive throw statements
- [ ] Type inference from schema definitions

### Environment Setup
- [ ] Database with llm_providers table exists
- [ ] Encryption key management (environment or generation)
- [ ] Testing framework configured for async operations
- [ ] Electron main process Node.js API access

---

## Task Completion Checklist

- [ ] ProviderService class created with all CRUD operations
- [ ] API key encryption/decryption implemented with AES-256-GCM
- [ ] Service follows existing AuthService patterns
- [ ] Database operations use established Drizzle query patterns
- [ ] Error handling consistent with project conventions
- [ ] Default provider management logic implemented
- [ ] Provider validation and security measures in place
- [ ] Unit tests created and passing for all service methods
- [ ] Integration tests verify end-to-end functionality
- [ ] TypeScript compilation passes without errors
- [ ] Linting passes without warnings
- [ ] Security review completed (no key exposure in logs/errors)

**Final Validation**: Run `npm test && npm run type-check` and verify all provider service operations work correctly with encrypted API key storage.