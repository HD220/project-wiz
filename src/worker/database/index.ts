// Export database connection
export { db, getDatabase } from "./connection";
export type { DatabaseType } from "./connection";

// Export all shared models from main database
export * from "@/main/database";