# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-01-shared-database-logger-config/spec.md

## Technical Requirements

### Shared Database Configuration Module
- Create `src/shared/database/config.ts` with centralized database setup
- Export standardized database connection factory function
- Include all current pragma settings (WAL mode, foreign keys enabled)
- Maintain existing Drizzle ORM integration patterns
- Support both main and worker process requirements
- Preserve existing database path resolution logic
- Ensure compatibility with current schema imports

### Unified Logger Configuration
- Create `src/shared/logger/config.ts` with Pino-based logger setup
- Implement context-aware logger factory similar to current main process pattern
- Support environment-based log level configuration (debug in dev, info in production)
- Include pretty-printing for development environment
- Maintain performance for worker process requirements
- Provide structured logging with consistent metadata format

### Configuration Management
- Create `src/shared/config/index.ts` for centralized environment variable handling
- Export typed configuration objects for database and logger settings
- Support process.env variable resolution with defaults
- Maintain backward compatibility with existing environment variables
- Include configuration validation and type safety

### Process Integration Points
- Update `src/main/database/connection.ts` to use shared configuration
- Update `src/worker/database/connection.ts` to use shared configuration  
- Replace console.log statements in worker process with shared logger
- Ensure both processes maintain their existing database access patterns
- Preserve current export structure for backward compatibility

### Migration Compatibility
- All existing database imports continue to work without changes
- Current logger usage in main process remains functional
- Worker database access maintains current behavior
- No breaking changes to public APIs or database schemas
- Gradual migration path for worker console.log replacement

## External Dependencies

No new external dependencies required. This spec uses existing libraries:
- **better-sqlite3** - Already used for database connections
- **drizzle-orm** - Already configured for ORM functionality  
- **pino** - Already used in main process for logging
- **pino-pretty** - Already used for development pretty-printing