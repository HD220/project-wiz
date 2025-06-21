import { setupTestDB } from "./setup/drizzle";
import "reflect-metadata";
import { vi } from "vitest";

// Configuração global para testes
if (process.env.VITEST_TEST_TYPE === "integration-db") {
  setupTestDB();
}
