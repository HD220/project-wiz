import { getLogger } from "../utils/logger";

export async function initializeAppServices(): Promise<void> {
  const logger = getLogger("app-services");

  logger.info("Initializing application services...");

  try {
    // Initialize database connection
    const { getDatabase } = await import("../database/connection");
    const db = getDatabase();

    // Simple health check
    await db.query.users.findFirst();

    logger.info("Application services initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize application services:", error);
    throw error;
  }
}
