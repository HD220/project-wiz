// src/infrastructure/tools/tool-registry.ts
import { IAgentTool } from '../../core/tools/tool.interface';
import { tool } from 'ai'; // For ai-sdk compatibility
import { z } from 'zod'; // Required for ReturnType<typeof tool> and schema definitions

export class ToolRegistry {
  private tools: Map<string, IAgentTool<any, any>> = new Map();

  registerTool(agentTool: IAgentTool<any, any>): void { // Renamed parameter to avoid conflict
    if (this.tools.has(agentTool.name)) {
      console.warn(`ToolRegistry: Tool with name '${agentTool.name}' is already registered. Overwriting.`);
    }
    this.tools.set(agentTool.name, agentTool);
    console.log(`ToolRegistry: Registered tool '${agentTool.name}'`);
  }

  getTool(toolName: string): IAgentTool<any, any> | undefined {
    return this.tools.get(toolName);
  }

  getAllTools(): IAgentTool<any, any>[] {
    return Array.from(this.tools.values());
  }
}

// Singleton instance of the registry
export const toolRegistry = new ToolRegistry();
