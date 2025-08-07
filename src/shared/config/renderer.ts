// Renderer-specific configuration
// Renderer process cannot access process.env directly in Electron

/**
 * Renderer Logger Configuration
 * Since renderer cannot access process.env, we use safe defaults
 */
export interface RendererLoggerConfig {
  level: string;
  prettyPrint: boolean;
  isProduction: boolean;
}

/**
 * Get logger configuration for renderer process
 * Uses safe defaults since process.env is not available
 */
export function getRendererLoggerConfig(): RendererLoggerConfig {
  // In renderer, we assume development unless explicitly set otherwise
  // This is safe because renderer logging is for debugging purposes
  const isDevelopment = true; // Always assume development in renderer for better debugging

  return {
    level: "debug", // Always debug in renderer for better development experience
    prettyPrint: isDevelopment,
    isProduction: false, // Always false in renderer for safety
  };
}
