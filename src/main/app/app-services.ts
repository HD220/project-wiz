import { ModuleLoader } from "../kernel/module-loader";
import { logger } from "../logger";
import { SeedService } from "../persistence/seed.service";

export async function initializeAppServices(): Promise<void> {
  await loadModules();
  await seedDatabase();
}

async function loadModules(): Promise<void> {
  const moduleLoader = new ModuleLoader();
  await moduleLoader.loadAndInitializeModules();
}

async function seedDatabase(): Promise<void> {
  const seedService = new SeedService();
  await seedService.runAllSeeds();
  logger.info("Database seeded successfully");
}
