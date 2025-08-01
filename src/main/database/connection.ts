// Main process database connection - now using shared configuration
// This file maintains backward compatibility with existing imports

import { createDatabaseConnection } from "@/shared/database/config";

// Create database connection using shared configuration
// This ensures consistency with worker process while maintaining all existing functionality
const { db, sqlite, getDatabase: getSharedDatabase } = createDatabaseConnection(true);

// Export database instance - SAME AS BEFORE
export { db };

// Export type - SAME AS BEFORE  
export type DatabaseType = typeof db;

// Export sqlite instance for direct access if needed - SAME AS BEFORE
export { sqlite };

// Utility function to get database instance - SAME AS BEFORE
export function getDatabase(): typeof db {
  return getSharedDatabase();
}
