// src_refactored/infrastructure/services/tool-registry/tool-registry.service.ts
import { injectable, inject } from 'inversify';

import { IToolRegistryService } from '@/core/application/ports/services/i-tool-registry.service';
import { ILoggerService } from '@/core/common/services/i-logger.service';
import { IAgentTool } from '@/core/tools/tool.interface.ts';

import { TYPES } from '@/infrastructure/ioc/types'; // Adjusted path

@injectable()
export class ToolRegistryService implements IToolRegistryService {
  private readonly tools: Map<string, IAgentTool<any, any>> = new Map();

  constructor(@inject(TYPES.ILoggerService) private readonly logger: ILoggerService) {
    this.logger.info('[ToolRegistryService] initialized');
  }

  registerTool(tool: IAgentTool<any, any>): void {
    if (this.tools.has(tool.name)) {
      this.logger.warn(`[ToolRegistryService] Tool with name '${tool.name}' is already registered. Overwriting.`);
    }
    this.tools.set(tool.name, tool);
    this.logger.info(`[ToolRegistryService] Tool '${tool.name}' registered.`);
  }

  getTool(toolName: string): IAgentTool<any, any> | undefined {
    return this.tools.get(toolName);
  }

  listTools(): IAgentTool<any, any>[] {
    return Array.from(this.tools.values());
  }
}
