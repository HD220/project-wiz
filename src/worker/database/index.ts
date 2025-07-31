// Export database connection
export { db, getDatabase } from "./connection";
export type { DatabaseType } from "./connection";

// Export only worker-specific database models
// Worker should only import from src/worker/models/, never from src/main/models/
export * from "../features/llm-jobs/llm-jobs.model";