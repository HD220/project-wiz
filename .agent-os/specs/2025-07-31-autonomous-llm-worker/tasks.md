# Spec Tasks

## Tasks

- [ ] 1. **Independent Job Queue Database Schema**
  - [ ] 1.1 Audit current database models and migration system
  - [ ] 1.2 Create `llm-jobs.model.ts` with system-agnostic BullMQ schema
  - [ ] 1.3 Generate and apply database migrations (no foreign keys to current system)
  - [ ] 1.4 Verify job queue schema with dependency-only relationships
  - [ ] 1.5 Test job dependency chains without system coupling

- [ ] 2. **Main Process Job Queue Integration**
  - [ ] 2.1 Audit existing service patterns for job submission
  - [ ] 2.2 Create `llm-job-queue.service.ts` for job creation and monitoring
  - [ ] 2.3 Implement job submission from chat/conversation features
  - [ ] 2.4 Add job status polling and result retrieval
  - [ ] 2.5 Create job progress monitoring for UI updates
  - [ ] 2.6 Verify job submission and result retrieval flow

- [ ] 3. **Worker Build System and Directory Structure**
  - [ ] 3.1 Create `src/worker/` directory structure following main pattern (features/, database/, utils/, worker.ts)
  - [ ] 3.2 Create `vite.worker.config.mts` following same pattern as vite.main.config.mts
  - [ ] 3.3 Update `forge.config.cts` to include worker as plugin configuration (no entry point)
  - [ ] 3.4 Create worker features/llm-jobs/ with model, service, types (same as main pattern)
  - [ ] 3.5 Setup worker database connection without schema option (same as main)
  - [ ] 3.6 Verify worker builds using plugin system like renderer

- [ ] 4. **Simple Worker Process Implementation**
  - [ ] 4.1 Implement worker.ts with simple Drizzle connection and fast polling (100ms intervals)
  - [ ] 4.2 Create basic HTTP clients for LLM APIs (focus on simplicity over performance)
  - [ ] 4.3 Add sequential job processing with dependency checking (no concurrency needed)
  - [ ] 4.4 Implement basic job status updates via Drizzle (completed/failed)
  - [ ] 4.5 Create simple utilityProcess.fork spawning in src/main/workers/worker-manager.ts
  - [ ] 4.6 Verify worker handles I/O bound operations correctly (HTTP calls only)

- [ ] 5. **Simple Database Communication System**
  - [ ] 5.1 Implement job submission from main process to database
  - [ ] 5.2 Create basic job status polling in main process (moderate polling - 500ms intervals)
  - [ ] 5.3 Add job submission from chat/conversation components via IPC handlers
  - [ ] 5.4 Create simple job result retrieval for UI updates
  - [ ] 5.5 Add basic error handling and job retry mechanism
  - [ ] 5.6 Verify worker isolation and automatic restart on crash
