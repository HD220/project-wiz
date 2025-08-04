import { BrowserWindow } from "electron";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("window-registry");

/**
 * Window Registry for managing BrowserWindow instances
 * Provides type-safe access to application windows for IPC handlers
 */
export class WindowRegistry {
  private windows = new Map<string, BrowserWindow>();

  /**
   * Register a window with a unique name
   */
  register(name: string, window: BrowserWindow): void {
    if (this.windows.has(name)) {
      logger.warn(`Window ${name} already registered, replacing`);
    }

    this.windows.set(name, window);
    logger.info(`✅ Window registered: ${name}`);

    // Auto-cleanup when window is closed
    window.once("closed", () => {
      this.unregister(name);
    });
  }

  /**
   * Get a window by name
   */
  get(name: string): BrowserWindow | null {
    const window = this.windows.get(name);
    
    if (!window) {
      return null;
    }

    // Check if window is still valid (not destroyed)
    if (window.isDestroyed()) {
      this.unregister(name);
      return null;
    }

    return window;
  }

  /**
   * Get the main application window
   */
  getMainWindow(): BrowserWindow | null {
    return this.get("main");
  }

  /**
   * Unregister a window
   */
  unregister(name: string): void {
    if (this.windows.has(name)) {
      this.windows.delete(name);
      logger.info(`🗑️ Window unregistered: ${name}`);
    }
  }

  /**
   * Get all registered window names
   */
  getRegisteredWindows(): string[] {
    return Array.from(this.windows.keys());
  }

  /**
   * Check if a window is registered and active
   */
  isRegistered(name: string): boolean {
    const window = this.windows.get(name);
    return window !== undefined && !window.isDestroyed();
  }

  /**
   * Clear all windows (for cleanup)
   */
  clear(): void {
    this.windows.clear();
    logger.info("🧹 All windows cleared from registry");
  }

  /**
   * Get registry stats for debugging
   */
  getStats(): { total: number; active: number; names: string[] } {
    const activeWindows = Array.from(this.windows.entries()).filter(
      ([, window]) => !window.isDestroyed()
    );

    return {
      total: this.windows.size,
      active: activeWindows.length,
      names: Array.from(this.windows.keys()),
    };
  }
}

// Global singleton instance
export const windowRegistry = new WindowRegistry();

// Convenience exports
export const registerWindow = (name: string, window: BrowserWindow) => 
  windowRegistry.register(name, window);
export const getWindow = (name: string) => 
  windowRegistry.get(name);
export const getMainWindow = () => 
  windowRegistry.getMainWindow();