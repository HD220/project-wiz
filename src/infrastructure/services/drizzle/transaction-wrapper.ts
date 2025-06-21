import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import type { ILogger } from "../../../core/ports/logger/ilogger.interface";

/**
 * Wrapper para gerenciar transações com Drizzle ORM
 *
 * @todo Refatorar para usar tipagem mais específica quando a tipagem do Drizzle estiver mais estável
 */
export class TransactionWrapper {
  constructor(
    private readonly db: BetterSQLite3Database,
    private readonly logger?: ILogger
  ) {}

  /**
   * Executa uma operação dentro de uma transação
   * @param operation Função a ser executada na transação
   * @returns Promise com o resultado da operação
   */
  async runInTransaction<T>(
    operation: (tx: SQLiteTransaction<any, any, any, any>) => Promise<T>
  ): Promise<T> {
    try {
      return await this.db.transaction(async (tx) => {
        try {
          const result = await operation(tx);
          return result;
        } catch (error: unknown) {
          this.logger?.error("Transaction operation failed", { error });
          throw error;
        }
      });
    } catch (error: unknown) {
      this.logger?.error("Transaction failed", { error });
      throw error;
    }
  }
}
