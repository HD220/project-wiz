// Main database - exports shared database connection directly
import { createDatabaseConnection } from "@/shared/database/config";

// Create database connection with Drizzle logging for main process
const { db, getDatabase } = createDatabaseConnection(true);

// Export database connection
export { db, getDatabase };
export type { DatabaseType } from "@/shared/database/config";

