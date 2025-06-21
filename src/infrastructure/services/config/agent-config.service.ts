// src/infrastructure/services/config/agent-config.service.ts

import fs from 'fs/promises';
import { AgentExecutorConfig, AgentExecutorModelConfig, AgentExecutorSummarizationConfig } from '../../../core/ports/agent/agent-executor-config.interface';
import { ConfigurationError } from '../../../core/common/errors'; // Assuming errors are here
// import { z } from 'zod'; // Optional: for more robust validation later

// TODO (RT005.2-Validation): Implement Zod schema for robust validation of AgentExecutorConfig
// const AgentExecutorModelConfigSchema = z.object({ ... });
// const AgentExecutorSummarizationConfigSchema = z.object({ ... });
// const AgentExecutorConfigSchema = z.object({ ... });

export class AgentConfigService {
  constructor() {}

  public async loadAgentExecutorConfig(filePath: string): Promise<AgentExecutorConfig> {
    let fileContent: string;
    try {
      fileContent = await fs.readFile(filePath, 'utf-8');
    } catch (error: any) {
      throw new ConfigurationError(\`Failed to read agent executor config file at '\${filePath}'. Error: \${error.message}\`, error);
    }

    let parsedConfig: any;
    try {
      parsedConfig = JSON.parse(fileContent);
    } catch (error: any) {
      throw new ConfigurationError(\`Failed to parse JSON from agent executor config file at '\${filePath}'. Error: \${error.message}\`, error);
    }

    // Basic manual validation (TODO: Replace with Zod or similar)
    if (!parsedConfig.mainLLM || typeof parsedConfig.mainLLM.provider !== 'string' || typeof parsedConfig.mainLLM.modelName !== 'string') {
      throw new ConfigurationError(\`Invalid or missing 'mainLLM' configuration in '\${filePath}'. It must have 'provider' and 'modelName' strings.\`);
    }

    if (parsedConfig.mainLLM.apiKeyEnvVar && typeof parsedConfig.mainLLM.apiKeyEnvVar !== 'string') {
        throw new ConfigurationError(\`If 'mainLLM.apiKeyEnvVar' is provided, it must be a string in '\${filePath}'.\`);
    }

    if (parsedConfig.summarization) {
      const summConf = parsedConfig.summarization as AgentExecutorSummarizationConfig;
      if (typeof summConf.maxHistoryMessagesBeforeSummary !== 'number' ||
          typeof summConf.numMessagesToSummarizeChunk !== 'number' ||
          typeof summConf.preserveInitialMessagesCount !== 'number') {
        throw new ConfigurationError(\`Invalid 'summarization' config in '\${filePath}'. Thresholds must be numbers.\`);
      }
      if (summConf.summarizationModel) {
        if (typeof summConf.summarizationModel.provider !== 'string' || typeof summConf.summarizationModel.modelName !== 'string') {
          throw new ConfigurationError(\`Invalid 'summarization.summarizationModel' config in '\${filePath}'. It must have 'provider' and 'modelName' strings.\`);
        }
        if (summConf.summarizationModel.apiKeyEnvVar && typeof summConf.summarizationModel.apiKeyEnvVar !== 'string') {
           throw new ConfigurationError(\`If 'summarization.summarizationModel.apiKeyEnvVar' is provided, it must be a string in '\${filePath}'.\`);
        }
      }
    }

    // If validation passes, cast to the interface type.
    // This is type assertion; runtime validation should ensure it's actually safe.
    return parsedConfig as AgentExecutorConfig;
  }
}
