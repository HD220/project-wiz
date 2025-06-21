import { describe, it, expect, vi, Mock } from "vitest";
import { TransactionWrapper } from "../../../../src/infrastructure/services/drizzle/transaction-wrapper";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { ILogger } from "../../../../src/core/ports/logger/ilogger.interface";

describe("TransactionWrapper", () => {
  const mockDb = {
    transaction: vi.fn(),
  } as unknown as BetterSQLite3Database;

  const mockLogger = {
    error: vi.fn(),
  } as unknown as ILogger;

  it("should execute a successful transaction", async () => {
    const mockOperation = vi.fn().mockResolvedValue("result");
    const mockTx = {} as any;

    (mockDb.transaction as Mock).mockImplementation(async (callback) => {
      return callback(mockTx);
    });

    const wrapper = new TransactionWrapper(mockDb);
    const result = await wrapper.runInTransaction(mockOperation);

    expect(result).toBe("result");
    expect(mockOperation).toHaveBeenCalledWith(mockTx);
    expect(mockDb.transaction).toHaveBeenCalled();
  });

  it("should reject when operation fails", async () => {
    const error = new Error("Operation failed");
    const mockOperation = vi.fn().mockRejectedValue(error);
    const mockTx = {} as any;

    (mockDb.transaction as Mock).mockRejectedValue(error);

    const wrapper = new TransactionWrapper(mockDb, mockLogger);

    await expect(wrapper.runInTransaction(mockOperation)).rejects.toThrow(
      error
    );
    expect(mockLogger.error).toHaveBeenCalledWith("Transaction failed", {
      error,
    });
  });

  it("should log error when transaction fails", async () => {
    const error = new Error("Transaction failed");
    (mockDb.transaction as Mock).mockRejectedValue(error);

    const wrapper = new TransactionWrapper(mockDb, mockLogger);

    await expect(wrapper.runInTransaction(vi.fn())).rejects.toThrow(error);
    expect(mockLogger.error).toHaveBeenCalledWith("Transaction failed", {
      error,
    });
  });
});
