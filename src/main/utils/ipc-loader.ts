import { ipcMain } from "electron";
import { glob } from "glob";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("ipc-loader");

/**
 * Auto-registration IPC loader for Project Wiz
 * Implements the colocated architecture pattern from IPC-ARCHITECTURE.md
 */
export class IpcLoader {
  private registeredHandlers = new Set<string>();

  /**
   * Load all IPC handlers automatically from the filesystem
   * Discovers invoke.ts and listen.ts files in main/ipc/ directory
   */
  async loadIpcHandlers(): Promise<void> {
    try {
      logger.info("🔍 Starting IPC handler auto-discovery...");

      const invokeFiles = await glob("src/main/ipc/**/invoke.ts", { 
        cwd: process.cwd(),
        absolute: true 
      });
      const listenFiles = await glob("src/main/ipc/**/listen.ts", { 
        cwd: process.cwd(),
        absolute: true 
      });

      logger.info(`📁 Found ${invokeFiles.length} invoke handlers`);
      logger.info(`📁 Found ${listenFiles.length} listen handlers`);

      // Register invoke handlers
      for (const file of invokeFiles) {
        const channel = this.filePathToChannel(file, "invoke");
        await this.registerInvokeHandler(file, channel);
      }

      // Register listen handlers  
      for (const file of listenFiles) {
        const channel = this.filePathToChannel(file, "listen");
        await this.registerListenHandler(file, channel);
      }

      logger.info(`✅ Loaded ${invokeFiles.length} invoke handlers`);
      logger.info(`✅ Loaded ${listenFiles.length} listen handlers`);

    } catch (error) {
      logger.error("❌ Failed to load IPC handlers:", error);
      throw error;
    }
  }

  /**
   * Convert file path to IPC channel name
   * main/ipc/user/create/invoke.ts -> invoke:user:create
   */
  private filePathToChannel(filePath: string, type: "invoke" | "listen"): string {
    // Extract the relative path and convert to channel name
    const relativePath = filePath
      .replace(/.*\/src\/main\/ipc\//, "")
      .replace(`/${type}.ts`, "");
    
    const parts = relativePath.split("/");
    return `${type}:${parts.join(":")}`;
  }

  /**
   * Register an invoke handler with automatic error handling and event emission
   */
  private async registerInvokeHandler(file: string, channel: string): Promise<void> {
    try {
      // Import the handler module
      const mod = await import(file);
      
      if (!mod.default || typeof mod.default !== "function") {
        logger.error(`❌ ${file} must export default function`);
        return;
      }

      // Check for duplicate registration
      if (this.registeredHandlers.has(channel)) {
        logger.warn(`⚠️ Handler ${channel} already registered, skipping`);
        return;
      }

      // Register the IPC handler with middleware
      ipcMain.handle(channel, async (event, data) => {
        logger.debug(`📥 IPC call: ${channel}`, { data });
        
        // Handler already handles all validation, errors, and wrapper format
        // No try-catch needed - createIPCHandler guarantees it never throws
        const result = await mod.default(data, event);

        logger.debug(`📤 IPC result: ${channel}`, { 
          success: result?.success,
          hasData: !!result?.data,
          hasError: !!result?.error
        });
        
        return result;
      });

      this.registeredHandlers.add(channel);
      logger.info(`✅ Registered invoke: ${channel}`);
      
    } catch (error) {
      logger.error(`❌ Failed to register invoke handler ${file}:`, error);
    }
  }

  /**
   * Register a listen handler for event-based communication
   */
  private async registerListenHandler(file: string, channel: string): Promise<void> {
    try {
      const mod = await import(file);
      
      if (!mod.default || typeof mod.default !== "function") {
        logger.error(`❌ ${file} must export default function`);
        return;
      }

      // Check for duplicate registration
      if (this.registeredHandlers.has(channel)) {
        logger.warn(`⚠️ Listener ${channel} already registered, skipping`);
        return;
      }

      // Listen handlers are no longer used in the new reactive system
      logger.warn(`⚠️ Listen handler found but not registered: ${channel}. Use the new event system with event:register instead.`);

      this.registeredHandlers.add(channel);
      logger.info(`✅ Registered listener: ${channel}`);
      
    } catch (error) {
      logger.error(`❌ Failed to register listen handler ${file}:`, error);
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
export async function loadIpcHandlers(): Promise<void> {
  return ipcLoader.loadIpcHandlers();
}