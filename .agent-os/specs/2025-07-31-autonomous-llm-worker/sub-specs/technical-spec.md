# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-07-31-autonomous-llm-worker/spec.md

## Technical Requirements

### Architecture Overview

- **Three-Process Architecture**: `src/main/` (Electron main), `src/renderer/` (UI), `src/worker/` (job processing)
- **BullMQ-Inspired Design**: Job queue system with dependency management and flexible job types
- **Electron Utility Process**: Worker using utilityProcess.fork with own Vite/Forge configuration
- **Complete Isolation**: Worker has zero knowledge of main/renderer models and structures
- **Shared Database Only**: Worker uses Drizzle ORM but only accesses job queue tables
- **Independent Build System**: Worker has its own Vite config, TypeScript setup, and dependencies

### Job Queue System Specifications

- **Job Types**: Different named job types (e.g., "process_message", "analyze_requirements", "generate_code")
- **Flexible Priority**: Numeric priority system (higher number = higher priority)
- **Job Dependencies**: Parent-child job relationships with dependency counting
- **Status Lifecycle**: waiting → active → completed/failed (BullMQ-style states)
- **Job Data**: JSON payloads containing job descriptions and parameters
- **Progress Tracking**: 0-100 progress percentage for long-running jobs

### Worker Process Requirements (src/worker/)

- **Independent Source Directory**: Complete `src/worker/` with own models, services, and entry point
- **Drizzle ORM Access**: Worker uses Drizzle but only imports job queue models, not main/renderer models
- **Own Build Configuration**: Separate Vite config (`vite.worker.config.mts`) and Forge integration
- **Process Isolation**: Launched via utilityProcess.fork with complete separation
- **Database Schema Isolation**: Worker only knows about `llm_jobs` table, ignorant of other system tables

### LLM Integration Layer (Worker-Contained)

- **Self-Contained Providers**: Worker process includes its own LLM provider implementations
- **No System Dependencies**: Worker doesn't depend on main application's provider system
- **Direct API Communication**: Worker makes direct calls to LLM APIs (OpenAI, Anthropic, etc.)
- **Rate Limiting**: Built-in rate limiting within worker process
- **Error Handling**: Complete error handling and retry logic within worker

### Performance Requirements (I/O Bound - Simplified)

- **Single Process**: One utility process handles jobs sequentially (sufficient for I/O bound)
- **Response Time**: 2-5 seconds acceptable (background processing, not realtime)
- **Memory Usage**: Worker process should not exceed 50MB (just HTTP calls)
- **Database Polling**: Fast polling (100ms) - responsive background processing
- **Process Isolation**: Lightweight isolation for simple HTTP operations

### Build System Requirements

- **Vite Worker Config**: `vite.worker.config.mts` for worker-specific build settings
- **Forge Integration**: Update `forge.config.cts` to include worker build pipeline
- **TypeScript Configuration**: Worker has access to shared `tsconfig.json` but only imports job models
- **Separate Entry Points**: Worker main file (`src/worker/main.ts`) independent of main process
- **Build Artifacts**: Worker builds to separate directory for utilityProcess.fork

### System Communication

- **Database-Only Communication**: Worker and main process communicate only through SQLite database
- **Shared Drizzle Schema**: Both processes access same database but worker only imports job models
- **No IPC Required**: All communication happens via job status updates in database
- **Schema Boundaries**: Worker imports from `src/worker/models/` only, never from `src/main/models/`

## External Dependencies

This specification maintains architectural separation:

- **Shared Database**: Same SQLite database accessed via Drizzle ORM in both processes
- **Isolated Drizzle Models**: Worker has its own model definitions for job queue only
- **Electron utilityProcess**: Built-in Electron API for process isolation
- **Independent LLM Clients**: Worker implements its own HTTP clients for LLM APIs
- **Separate Build Pipeline**: Worker has its own Vite config and dependency management
