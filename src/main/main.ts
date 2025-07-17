import { AppInitializer } from "./app/app-initializer";

const appInitializer = new AppInitializer();
import { logger } from "./logger";

appInitializer.initialize().catch((error) => {
  logger.error("Failed to initialize application:", error);
});
