import { setupTestDB } from "./setup/drizzle";

// Configuração global para testes
if (process.env.VITEST_TEST_TYPE === "integration-db") {
  setupTestDB();
}
