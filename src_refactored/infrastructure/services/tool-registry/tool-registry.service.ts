import { injectable, inject } from "inversify";
import { ZodAny } from "zod";

import { IToolRegistryService } from "@/core/application/ports/services/i-tool-registry.service";
import { ILogger } from "@/core/common/services/i-logger.service";
import { IAgentTool } from "@/core/tools/tool.interface.ts";

import { TYPES } from "@/infrastructure/ioc/types";

@injectable()
export class ToolRegistryService implements IToolRegistryService {
  private readonly tools: Map<string, IAgentTool<ZodAny, unknown>> = new Map();

  constructor(
    @inject(TYPES.ILogger) private readonly logger: ILogger
    // Corrected token and type
  ) {
    this.logger.info("[ToolRegistryService] initialized");
  }

  registerTool(tool: IAgentTool<ZodAny, unknown>): void {
    if (this.tools.has(tool.name)) {
      this.logger.warn(
        `[ToolRegistryService] Tool with name '${tool.name}' is already registered. Overwriting.`
      );
    }
    this.tools.set(tool.name, tool);
    this.logger.info(`[ToolRegistryService] Tool '${tool.name}' registered.`);
  }

  getTool(toolName: string): IAgentTool<ZodAny, unknown> | undefined {
    return this.tools.get(toolName);
  }

  listTools(): IAgentTool<ZodAny, unknown>[] {
    return Array.from(this.tools.values());
  }
}
