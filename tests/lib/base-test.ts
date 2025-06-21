import { beforeAll, afterAll } from "vitest";
import { setupTestDB, teardownTestDB } from "../setup/drizzle";

/**
 * Classe base para testes com:
 * - Configuração do banco de dados
 * - Hooks compartilhados
 * - Utilitários comuns
 */
export abstract class BaseTest {
  static setup() {
    beforeAll(async () => {
      await setupTestDB();
    });

    afterAll(async () => {
      await teardownTestDB();
    });
  }
}
