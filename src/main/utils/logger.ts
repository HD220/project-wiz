// Main process logger - now using shared configuration
// This file maintains backward compatibility with existing imports

import { getLogger as getSharedLogger, getGlobalLogger } from "@/shared/logger/config";

/**
 * Get a logger instance with specific context
 * This is the main function to use throughout the application
 * Now uses shared logger configuration for consistency across processes
 */
export function getLogger(context: string): ReturnType<typeof getSharedLogger> {
  return getSharedLogger(context);
}

// Default logger export for simple cases - SAME AS BEFORE
export default getGlobalLogger();
