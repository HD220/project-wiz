# Architecture & Product Decisions

## Overview
This document captures key architectural and product decisions made during Project Wiz development, providing context for future development and maintenance.

## Platform Decisions

### Decision: Desktop-First with Electron
**Date**: Project Inception
**Status**: Implemented
**Context**: Choice between web app, desktop app, or hybrid approach
**Decision**: Build as Electron desktop application
**Rationale**:
- Complete control over local file system for Git operations
- Enhanced security with local data storage
- No dependency on cloud services for core functionality
- Familiar web technologies for rapid development
- Cross-platform distribution from single codebase
**Consequences**:
- Larger download size than web app
- Manual update distribution
- Platform-specific testing requirements

### Decision: Local-First Data Architecture
**Date**: Project Inception
**Status**: Implemented
**Context**: Data storage strategy for enterprise customers
**Decision**: SQLite for local persistence, no mandatory cloud
**Rationale**:
- Data sovereignty for enterprise customers
- No latency for database operations
- Simplified deployment and maintenance
- No recurring infrastructure costs
- Works offline by default
**Consequences**:
- Multi-user collaboration requires additional architecture
- Backup responsibility on users
- Future cloud sync will be additive complexity

## Technology Stack Decisions

### Decision: React 19 with TypeScript
**Date**: Project Inception
**Status**: Implemented
**Context**: Frontend framework selection
**Decision**: React 19 with 100% TypeScript coverage
**Rationale**:
- React's maturity and ecosystem
- TypeScript provides type safety across IPC boundaries
- Strong community support and documentation
- Concurrent features in React 19 for better UX
- Excellent tooling and IDE support
**Trade-offs**:
- Larger bundle size than alternatives like Solid or Svelte
- Steeper learning curve for TypeScript

### Decision: TanStack Router over Next.js App Router
**Date**: Early Development
**Status**: Implemented
**Context**: Routing solution for Electron app
**Decision**: TanStack Router with file-based routing
**Rationale**:
- Designed for SPA architecture (perfect for Electron)
- Complete type safety including route parameters
- No SSR overhead unnecessary for desktop app
- Lighter weight than Next.js
- Better control over routing behavior
**Trade-offs**:
- Smaller ecosystem than Next.js
- Less documentation and examples

### Decision: Vercel AI SDK for LLM Integration
**Date**: AI Integration Phase
**Status**: Implemented
**Context**: Choosing AI integration approach
**Decision**: Vercel AI SDK as abstraction layer
**Rationale**:
- Unified interface for multiple providers
- Stream handling built-in
- Active development and support
- Provider switching without code changes
- Good TypeScript support
**Consequences**:
- Dependency on third-party SDK
- Must maintain compatibility with SDK updates

### Decision: SQLite with Drizzle ORM
**Date**: Database Design Phase
**Status**: Implemented
**Context**: Database and ORM selection
**Decision**: SQLite with Drizzle ORM over Prisma
**Rationale**:
- Drizzle is lighter weight and faster
- Better TypeScript integration
- No separate schema language (uses TypeScript)
- More flexible for complex queries
- No build step required
**Trade-offs**:
- Smaller community than Prisma
- Less mature ecosystem
- Manual migration management

## Architecture Decisions

### Decision: Feature-Based File Organization
**Date**: Early Development
**Status**: Implemented
**Context**: Code organization strategy
**Decision**: Organize by feature rather than file type
**Rationale**:
- Better code locality and cohesion
- Easier to understand feature boundaries
- Simplified refactoring and deletion
- Natural code ownership boundaries
- Supports future modularization
**Implementation**:
```
src/renderer/features/
├── agent/           # All agent-related code
├── auth/            # Authentication feature
├── chat/            # Chat functionality
└── project/         # Project management
```

### Decision: Type-Safe IPC with Zod Validation
**Date**: IPC Design Phase
**Status**: Implemented
**Context**: Inter-process communication design
**Decision**: Custom IPC handler with Zod schemas
**Rationale**:
- Runtime validation at process boundaries
- Automatic TypeScript type inference
- Single source of truth for API contracts
- Better error messages for debugging
- Protection against malformed data
**Implementation**: `createIPCHandler` utility pattern

### Decision: Soft Deletion Pattern
**Date**: Database Design Phase
**Status**: Implemented
**Context**: Data deletion strategy
**Decision**: Timestamp-based soft deletion (deactivatedAt)
**Rationale**:
- Audit trail requirements
- Data recovery capabilities
- Referential integrity maintenance
- Compliance with data retention policies
- Gradual transition from boolean flags
**Trade-offs**:
- Increased query complexity
- Larger database size over time

### Decision: Three-Process Architecture
**Date**: Architecture Design
**Status**: Implemented
**Context**: Process separation strategy
**Decision**: Main, Renderer, and Worker processes
**Rationale**:
- Security through process isolation
- UI responsiveness (renderer separate from heavy operations)
- Background AI processing without blocking
- Clear separation of concerns
- Crash isolation
**Consequences**:
- Complex IPC messaging
- State synchronization challenges
- Debugging across processes

## AI Integration Decisions

### Decision: Multi-Provider Support from Day One
**Date**: AI Integration Phase
**Status**: Implemented
**Context**: LLM provider strategy
**Decision**: Support OpenAI, Anthropic, and DeepSeek simultaneously
**Rationale**:
- Avoid vendor lock-in
- Different models for different tasks
- Fallback options for reliability
- Cost optimization opportunities
- User preference accommodation
**Implementation**: Provider registry pattern with encrypted credentials

### Decision: Agent Memory Persistence
**Date**: Agent System Design
**Status**: Implemented
**Context**: Agent state management
**Decision**: Persistent memory with importance scoring
**Rationale**:
- Maintain context across sessions
- Build agent expertise over time
- Enable long-term learning
- Support complex multi-step tasks
- Differentiate from stateless assistants
**Trade-offs**:
- Storage requirements grow over time
- Memory management complexity

### Decision: Discord-Like Interface Metaphor
**Date**: UX Design Phase
**Status**: Implemented
**Context**: User interface paradigm
**Decision**: Model UI after Discord/Slack
**Rationale**:
- Familiar to developer audience
- Proven UX patterns
- Natural project/channel organization
- Built-in collaboration metaphors
- Reduces learning curve
**Implementation**: Projects as "servers", channels for topics, DMs for private chats

## Security Decisions

### Decision: AES-256-GCM for API Keys
**Date**: Security Design Phase
**Status**: Implemented
**Context**: API key storage strategy
**Decision**: Native Node.js crypto with AES-256-GCM
**Rationale**:
- Industry standard encryption
- No external dependencies
- Hardware acceleration support
- Authenticated encryption mode
- FIPS compliance
**Implementation**: Encrypted storage in database with user-specific keys

### Decision: JWT with Session Management
**Date**: Authentication Design
**Status**: Implemented
**Context**: Authentication approach
**Decision**: JWT tokens with server-side session tracking
**Rationale**:
- Stateless authentication for scalability
- Session invalidation capability
- Standard approach with good tooling
- Flexible expiration policies
- Support for future distributed architecture
**Trade-offs**:
- Token size overhead
- Revocation complexity

## Product Decisions

### Decision: Natural Language as Primary Interface
**Date**: Product Conception
**Status**: Implemented
**Context**: User interaction paradigm
**Decision**: Conversational AI over traditional forms/commands
**Rationale**:
- Lower barrier to entry
- More intuitive for non-technical users
- Flexibility in expressing intent
- Aligns with AI capabilities
- Differentiates from traditional tools
**Challenges**:
- Intent understanding accuracy
- User expectation management

### Decision: Autonomous Execution vs Suggestions
**Date**: Product Design Phase
**Status**: Implemented
**Context**: AI agent behavior model
**Decision**: Agents execute autonomously rather than just suggest
**Rationale**:
- True automation value proposition
- Reduces user cognitive load
- Faster development cycles
- Competitive differentiation
- Matches "virtual team" metaphor
**Risk Mitigation**:
- Comprehensive logging
- Rollback capabilities
- User approval gates for critical operations

## Future Considerations

### Under Evaluation

1. **PostgreSQL Migration**
   - For multi-user scenarios
   - Better concurrent access
   - Advanced query capabilities

2. **WebContainer Integration**
   - In-browser code execution
   - Sandboxed testing environment
   - Real-time preview capabilities

3. **Custom Model Fine-Tuning**
   - Organization-specific patterns
   - Improved accuracy
   - Reduced token usage

4. **Plugin Architecture**
   - Community extensions
   - Custom agent types
   - Third-party integrations

### Deferred Decisions

1. **Cloud Sync Architecture** - Waiting for user demand
2. **Mobile Companion App** - Focusing on desktop experience
3. **Voice Interface** - Evaluating user interest
4. **Blockchain Integration** - No clear use case yet

## Lessons Learned

### What Worked Well
- TypeScript everywhere prevents entire classes of bugs
- Feature-based organization scales well
- IPC abstraction layer simplifies development
- Discord metaphor resonates with users
- Local-first approach appreciated by enterprises

### What We'd Do Differently
- Start with PostgreSQL for easier scaling path
- Implement telemetry earlier for usage insights
- Build plugin system from the beginning
- More investment in automated testing
- Earlier focus on performance optimization

## Decision Log Format

For future decisions, use this template:

```markdown
### Decision: [Title]
**Date**: YYYY-MM-DD
**Status**: Proposed|Accepted|Implemented|Deprecated
**Context**: What problem or requirement triggered this decision?
**Decision**: What was decided?
**Rationale**: Why was this decision made?
**Consequences**: What are the implications?
**Alternatives Considered**: What other options were evaluated?
```