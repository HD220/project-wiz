import { ipcMain } from "electron";
import { sync as globSync } from "glob";
import { pathToFileURL } from "url";
import { existsSync } from "fs";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("ipc-loader");

// Static handler imports for production builds
interface HandlerDefinition {
  path: string;
  channel: string;
}

const PRODUCTION_HANDLERS: {
  invoke: HandlerDefinition[];
  listen: HandlerDefinition[];
} = {
  invoke: [
    // Agent handlers
    { path: "@/main/ipc/agent/activate/invoke", channel: "invoke:agent:activate" },
    { path: "@/main/ipc/agent/count-active/invoke", channel: "invoke:agent:count-active" },
    { path: "@/main/ipc/agent/create/invoke", channel: "invoke:agent:create" },
    { path: "@/main/ipc/agent/get/invoke", channel: "invoke:agent:get" },
    { path: "@/main/ipc/agent/inactivate/invoke", channel: "invoke:agent:inactivate" },
    { path: "@/main/ipc/agent/list/invoke", channel: "invoke:agent:list" },
    { path: "@/main/ipc/agent/update/invoke", channel: "invoke:agent:update" },
    
    // Auth handlers
    { path: "@/main/ipc/auth/check-login/invoke", channel: "invoke:auth:check-login" },
    { path: "@/main/ipc/auth/get-current/invoke", channel: "invoke:auth:get-current" },
    { path: "@/main/ipc/auth/get-session/invoke", channel: "invoke:auth:get-session" },
    { path: "@/main/ipc/auth/get-user/invoke", channel: "invoke:auth:get-user" },
    { path: "@/main/ipc/auth/login/invoke", channel: "invoke:auth:login" },
    { path: "@/main/ipc/auth/logout/invoke", channel: "invoke:auth:logout" },
    { path: "@/main/ipc/auth/register/invoke", channel: "invoke:auth:register" },
    
    // Channel handlers
    { path: "@/main/ipc/channel/archive/invoke", channel: "invoke:channel:archive" },
    { path: "@/main/ipc/channel/create/invoke", channel: "invoke:channel:create" },
    { path: "@/main/ipc/channel/get/invoke", channel: "invoke:channel:get" },
    { path: "@/main/ipc/channel/inactivate/invoke", channel: "invoke:channel:inactivate" },
    { path: "@/main/ipc/channel/list/invoke", channel: "invoke:channel:list" },
    { path: "@/main/ipc/channel/list-messages/invoke", channel: "invoke:channel:list-messages" },
    { path: "@/main/ipc/channel/send-message/invoke", channel: "invoke:channel:send-message" },
    { path: "@/main/ipc/channel/unarchive/invoke", channel: "invoke:channel:unarchive" },
    { path: "@/main/ipc/channel/update/invoke", channel: "invoke:channel:update" },
    
    // DM handlers
    { path: "@/main/ipc/dm/add-participant/invoke", channel: "invoke:dm:add-participant" },
    { path: "@/main/ipc/dm/archive/invoke", channel: "invoke:dm:archive" },
    { path: "@/main/ipc/dm/create/invoke", channel: "invoke:dm:create" },
    { path: "@/main/ipc/dm/get/invoke", channel: "invoke:dm:get" },
    { path: "@/main/ipc/dm/inactivate/invoke", channel: "invoke:dm:inactivate" },
    { path: "@/main/ipc/dm/list/invoke", channel: "invoke:dm:list" },
    { path: "@/main/ipc/dm/list-messages/invoke", channel: "invoke:dm:list-messages" },
    { path: "@/main/ipc/dm/remove-participant/invoke", channel: "invoke:dm:remove-participant" },
    { path: "@/main/ipc/dm/send-message/invoke", channel: "invoke:dm:send-message" },
    { path: "@/main/ipc/dm/unarchive/invoke", channel: "invoke:dm:unarchive" },
    
    // Event handlers
    { path: "@/main/ipc/event/register/invoke", channel: "invoke:event:register" },
    
    // LLM Provider handlers
    { path: "@/main/ipc/llm-provider/create/invoke", channel: "invoke:llm-provider:create" },
    { path: "@/main/ipc/llm-provider/get/invoke", channel: "invoke:llm-provider:get" },
    { path: "@/main/ipc/llm-provider/get-default/invoke", channel: "invoke:llm-provider:get-default" },
    { path: "@/main/ipc/llm-provider/get-key/invoke", channel: "invoke:llm-provider:get-key" },
    { path: "@/main/ipc/llm-provider/inactivate/invoke", channel: "invoke:llm-provider:inactivate" },
    { path: "@/main/ipc/llm-provider/list/invoke", channel: "invoke:llm-provider:list" },
    { path: "@/main/ipc/llm-provider/set-default/invoke", channel: "invoke:llm-provider:set-default" },
    { path: "@/main/ipc/llm-provider/update/invoke", channel: "invoke:llm-provider:update" },
    
    // Profile handlers
    { path: "@/main/ipc/profile/get-theme/invoke", channel: "invoke:profile:get-theme" },
    { path: "@/main/ipc/profile/update/invoke", channel: "invoke:profile:update" },
    
    // Project handlers
    { path: "@/main/ipc/project/archive/invoke", channel: "invoke:project:archive" },
    { path: "@/main/ipc/project/create/invoke", channel: "invoke:project:create" },
    { path: "@/main/ipc/project/get/invoke", channel: "invoke:project:get" },
    { path: "@/main/ipc/project/list/invoke", channel: "invoke:project:list" },
    { path: "@/main/ipc/project/update/invoke", channel: "invoke:project:update" },
    
    // User handlers
    { path: "@/main/ipc/user/activate/invoke", channel: "invoke:user:activate" },
    { path: "@/main/ipc/user/create/invoke", channel: "invoke:user:create" },
    { path: "@/main/ipc/user/get/invoke", channel: "invoke:user:get" },
    { path: "@/main/ipc/user/get-by-type/invoke", channel: "invoke:user:get-by-type" },
    { path: "@/main/ipc/user/get-user-stats/invoke", channel: "invoke:user:get-user-stats" },
    { path: "@/main/ipc/user/inactivate/invoke", channel: "invoke:user:inactivate" },
    { path: "@/main/ipc/user/list/invoke", channel: "invoke:user:list" },
    { path: "@/main/ipc/user/list-agents/invoke", channel: "invoke:user:list-agents" },
    { path: "@/main/ipc/user/list-available-users/invoke", channel: "invoke:user:list-available-users" },
    { path: "@/main/ipc/user/list-humans/invoke", channel: "invoke:user:list-humans" },
    { path: "@/main/ipc/user/update/invoke", channel: "invoke:user:update" },
    
    // Window handlers
    { path: "@/main/ipc/window/close/invoke", channel: "invoke:window:close" },
    { path: "@/main/ipc/window/maximize/invoke", channel: "invoke:window:maximize" },
    { path: "@/main/ipc/window/minimize/invoke", channel: "invoke:window:minimize" },
    { path: "@/main/ipc/window/toggle-size/invoke", channel: "invoke:window:toggle-size" },
  ],
  listen: [] // No listen handlers in current implementation
};

/**
 * Auto-registration IPC loader for Project Wiz
 * Implements the colocated architecture pattern from IPC-ARCHITECTURE.md
 * 
 * Uses dynamic discovery in development and static imports in production
 */
export class IpcLoader {
  private registeredHandlers = new Set<string>();

  /**
   * Load all IPC handlers automatically
   * Uses glob discovery in development, static imports in production
   */
  async loadIpcHandlers(): Promise<void> {
    try {
      logger.info("🔍 Starting IPC handler loading...");

      if (this.isDevelopmentMode()) {
        await this.loadHandlersDynamically();
      } else {
        await this.loadHandlersStatically();
      }

    } catch (error) {
      logger.error("❌ Failed to load IPC handlers:", error);
      throw error;
    }
  }

  /**
   * Check if we're in development or production mode
   * Now that IPC handlers are external, we can use dynamic discovery
   */
  private isDevelopmentMode(): boolean {
    // Check if source files exist for dynamic discovery
    const hasSourceFiles = existsSync("src/main/ipc");
    logger.info(`🔍 Development mode check: source files exist = ${hasSourceFiles}`);
    return hasSourceFiles;
  }

  /**
   * Load handlers dynamically using glob (development mode)
   */
  private async loadHandlersDynamically(): Promise<void> {
    logger.info("🛠️ Loading handlers dynamically (development mode)");

    // Look for compiled .js files in various possible locations
    let invokeFiles: string[] = [];
    let listenFiles: string[] = [];
    
    const possiblePaths = [
      ".vite/build/main/ipc/**/invoke.js",     // preserveModules structure
      ".vite/build/src/main/ipc/**/invoke.js", 
      "dist/main/ipc/**/invoke.js",            // preserveModules in dist
      "dist/src/main/ipc/**/invoke.js", 
      "out/main/ipc/**/invoke.js"
    ];
    
    for (const pattern of possiblePaths) {
      invokeFiles = globSync(pattern, { absolute: true });
      if (invokeFiles.length > 0) {
        listenFiles = globSync(pattern.replace("invoke.js", "listen.js"), { absolute: true });
        logger.info(`🔄 Found compiled files using pattern: ${pattern}`);
        break;
      }
    }
    
    // Fallback: if still no compiled files, we have a problem
    if (invokeFiles.length === 0) {
      logger.error("❌ No compiled IPC handler files found. Check Vite build output.");
      const tsFiles = globSync("src/main/ipc/**/invoke.ts", { absolute: true });
      logger.info(`📁 Found ${tsFiles.length} .ts source files but they cannot be imported directly`);
      return;
    }

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
  }

  /**
   * Load handlers using bundled discovery (production mode)
   */
  private async loadHandlersStatically(): Promise<void> {
    logger.info("📦 Loading handlers from bundled code (production mode)");

    // In production, all handlers are bundled into the main.js file
    // We need to register them using the pre-defined list since we can't scan files
    let invokeCount = 0;
    for (const handler of PRODUCTION_HANDLERS.invoke) {
      try {
        // Use dynamic import with the bundled paths
        const mod = await import(handler.path);
        await this.registerStaticHandler(mod.default, handler.channel);
        invokeCount++;
      } catch (error) {
        logger.warn(`⚠️ Handler ${handler.path} not found in bundle, skipping`);
      }
    }

    logger.info(`✅ Loaded ${invokeCount} invoke handlers from bundle`);
    logger.info(`✅ No listen handlers (using new event system)`);
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
   * Register a static handler (production mode)
   */
  private async registerStaticHandler(handlerFunction: Function, channel: string): Promise<void> {
    try {
      if (!handlerFunction || typeof handlerFunction !== "function") {
        logger.error(`❌ Invalid handler function for ${channel}`);
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
        
        const result = await handlerFunction(data, event);

        logger.debug(`📤 IPC result: ${channel}`, { 
          success: result?.success,
          hasData: !!result?.data,
          hasError: !!result?.error
        });
        
        return result;
      });

      this.registeredHandlers.add(channel);
      logger.info(`✅ Registered static handler: ${channel}`);
      
    } catch (error) {
      logger.error(`❌ Failed to register static handler ${channel}:`, error);
    }
  }

  /**
   * Register an invoke handler with automatic error handling and event emission
   */
  private async registerInvokeHandler(file: string, channel: string): Promise<void> {
    try {
      // Import the handler module - convert Windows paths to file:// URLs
      const fileUrl = pathToFileURL(file).href;
      const mod = await import(fileUrl);
      
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
      // Import the handler module - convert Windows paths to file:// URLs
      const fileUrl = pathToFileURL(file).href;
      const mod = await import(fileUrl);
      
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