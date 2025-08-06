import { ipcMain } from "electron";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("ipc-loader");

// Handler definition interface
interface HandlerRegistration {
  handler: Function;
  channel: string;
}

/**
 * Simple IPC loader that registers handlers from an array
 * Main process imports all handlers and passes them here
 */
export class IpcLoader {
  private registeredHandlers = new Set<string>();

  /**
   * Load IPC handlers from provided array
   */
  async loadIpcHandlers(handlers: HandlerRegistration[]): Promise<void> {
    try {
      logger.info("🔍 Starting IPC handler registration...");

      let successCount = 0;
      for (const { handler, channel } of handlers) {
        if (await this.registerHandler(handler, channel)) {
          successCount++;
        }
      }

      logger.info(`✅ Successfully registered ${successCount}/${handlers.length} IPC handlers`);

    } catch (error) {
      logger.error("❌ Failed to load IPC handlers:", error);
      throw error;
    }
  }

  /**
   * Register a single handler
   */
  private async registerHandler(handlerFunction: Function, channel: string): Promise<boolean> {
    try {
      if (!handlerFunction || typeof handlerFunction !== "function") {
        logger.error(`❌ Invalid handler function for ${channel}`);
        return false;
      }

      // Check for duplicate registration
      if (this.registeredHandlers.has(channel)) {
        logger.warn(`⚠️ Handler ${channel} already registered, skipping`);
        return false;
      }

      // Register the IPC handler
      ipcMain.handle(channel, async (event, data) => {
        logger.debug(`📥 IPC call: ${channel}`, { data });
        
        const result = await handlerFunction(data, event);

        logger.debug(`📤 IPC result: ${channel}`, { 
          success: result?.success,
          hasData: !!result?.data,
          hasError: !!result?.error
        });
        
        return result;
      });

      this.registeredHandlers.add(channel);
      logger.info(`✅ Registered: ${channel}`);
      return true;
      
    } catch (error) {
      logger.error(`❌ Failed to register handler ${channel}:`, error);
      return false;
    }
  }

  /**
   * Get registration stats for monitoring
   */
  getStats(): { registeredCount: number; channels: string[] } {
    return {
      registeredCount: this.registeredHandlers.size,
      channels: Array.from(this.registeredHandlers).sort(),
    };
  }

  /**
   * Clear all registered handlers (for testing/cleanup)
   */
  clear(): void {
    this.registeredHandlers.clear();
    logger.info("🧹 Cleared all registered handlers");
  }
}

// Global singleton instance
export const ipcLoader = new IpcLoader();

// Convenience export function
export async function loadIpcHandlers(handlers: HandlerRegistration[]): Promise<void> {
  return ipcLoader.loadIpcHandlers(handlers);
}

// Export type for use in main.ts
export type { HandlerRegistration };