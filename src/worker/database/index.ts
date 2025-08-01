// Worker database - exports shared database connection directly
import { createDatabaseConnection } from "@/shared/database/config";

// Create database connection with no Drizzle logging for worker performance
const { db, getDatabase } = createDatabaseConnection(false);

// Export database connection
export { db, getDatabase };
export type { DatabaseType } from "@/shared/database/config";