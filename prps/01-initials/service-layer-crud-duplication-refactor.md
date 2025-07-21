# Service Layer CRUD Duplication Refactor

## Executive Summary

Eliminate code duplication across service layer by implementing a base service class that provides common CRUD operations. Currently, 5+ service files contain nearly identical `findById`, `update`, and `delete` methods, leading to maintenance overhead and potential inconsistencies.

## Context and Motivation

The codebase follows excellent architectural patterns but suffers from significant code duplication in the service layer. Every service class implements nearly identical CRUD methods:

- **AgentService.findById** (lines 104-114): 11 lines
- **ProjectService.findById** (lines 33-43): 11 lines  
- **LLMProviderService.findById** (lines 129-140): 12 lines
- **ConversationService.findById** (lines 102-114): 13 lines

This pattern multiplies across update, delete, and other common operations, creating ~50+ lines of duplicated code per service. This violates DRY principles and creates maintenance risks when database patterns need updates.

## Scope

### Included:

- Create abstract `BaseService<T, TInsert, TUpdate>` class with common CRUD operations
- Refactor existing services to extend base class
- Standardize error handling patterns across all services
- Maintain type safety with Drizzle inference
- Preserve existing public APIs (no breaking changes)

### Not Included:

- Complex domain-specific service methods
- IPC handler changes (those remain unchanged)
- Database schema modifications
- Frontend integration changes

## Expected Impact

- **Users:** No direct impact - all existing functionality preserved
- **Developers:** 
  - Reduce service file sizes by ~30-40%
  - Eliminate CRUD duplication across 5+ service files
  - Standardize error handling patterns
  - Faster development of new services
- **System:** 
  - Improved maintainability
  - Consistent error handling patterns
  - Type-safe generic CRUD operations

## Success Criteria

- All services extend `BaseService` with proper type parameters
- Remove ~200+ lines of duplicated CRUD code
- Maintain 100% backward compatibility with existing IPC handlers
- All existing tests pass (once test suite is implemented)
- New services can be created 50% faster using base class