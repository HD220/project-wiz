export { db, getDatabase } from "./connection";
export type { DatabaseType } from "./connection";

// Re-export all schemas from co-located locations
export * from "./schema-consolidated";
