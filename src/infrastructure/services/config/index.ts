// src/infrastructure/services/config/index.ts

import { AgentConfigService } from './agent-config.service';
import { AgentExecutorConfig } from '../../../core/ports/agent/agent-executor-config.interface';
import { ConfigurationError } from '../../../core/common/errors'; // For re-throwing or specific error handling
import { logger } from '../logging'; // Assuming logger is available here
import path from 'path';

// Determine the default config path. This could be made more flexible later (e.g., via env var).
const DEFAULT_CONFIG_PATH = path.resolve(process.cwd(), 'config', 'agent-executor.config.json');

let loadedAgentExecutorConfig: AgentExecutorConfig | null = null;
let loadPromise: Promise<AgentExecutorConfig> | null = null;

/**
 * Retrieves the loaded AgentExecutorConfig.
 * Loads the configuration from the default path on the first call and caches it.
 * Handles concurrent calls by ensuring the loading process is only initiated once.
 *
 * @returns A Promise resolving to the AgentExecutorConfig.
 * @throws {ConfigurationError} if loading or validation fails.
 */
export function getAgentExecutorConfig(): Promise<AgentExecutorConfig> {
  if (loadedAgentExecutorConfig) {
    return Promise.resolve(loadedAgentExecutorConfig);
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    const configService = new AgentConfigService();
    logger.info(\`Loading agent executor configuration from: \${DEFAULT_CONFIG_PATH}\`);
    try {
      const config = await configService.loadAgentExecutorConfig(DEFAULT_CONFIG_PATH);
      loadedAgentExecutorConfig = config;
      logger.info("Agent executor configuration loaded successfully.");
      return loadedAgentExecutorConfig;
    } catch (error: any) {
      logger.error("Failed to load agent executor configuration.", error, { configPath: DEFAULT_CONFIG_PATH });
      // Reset loadPromise so subsequent calls can retry if appropriate, or just let it fail permanently.
      // For this setup, let's make it a permanent failure for the current app instance.
      // loadPromise = null; // Uncomment to allow retries on subsequent calls

      // Re-throw as a ConfigurationError or a more specific error if not already one
      if (error instanceof ConfigurationError) {
        throw error;
      }
      throw new ConfigurationError(
        \`Critical failure loading agent executor config from \${DEFAULT_CONFIG_PATH}: \${error.message || String(error)}\`,
        error
      );
    }
  })();

  return loadPromise;
}

/**
 * Utility function to clear the cached agent executor configuration.
 * Primarily useful for testing or scenarios requiring a configuration reload.
 */
export function clearCachedAgentExecutorConfig(): void {
  loadedAgentExecutorConfig = null;
  loadPromise = null;
  logger.info("Cleared cached agent executor configuration.");
}
