// Export database connection
export { db, getDatabase } from "./connection";
export type { DatabaseType } from "./connection";

// Worker database only exports its own connection
// Models should be imported directly from their respective locations