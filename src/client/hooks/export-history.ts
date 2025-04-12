import { IpcHistoryServiceAdapter } from "../services/ipc-history-service-adapter";
import { ExportFormat } from "../types/history";
import { IHistoryService } from "../types/history-service";

/**
 * Utility to export conversation history.
 * Allows optional injection of a history service for testability.
 */
export async function exportHistory(
  format: ExportFormat,
  historyService?: IHistoryService
): Promise<Blob | string | null> {
  const service = historyService ?? new IpcHistoryServiceAdapter();
  if (format !== "json" && format !== "csv") {
    throw new Error("Invalid export format");
  }
  try {
    return await service.exportHistory(format);
  } catch (err: any) {
    throw new Error(err?.message || "Error exporting history");
  }
}