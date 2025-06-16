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

  // Method to get tool definitions in a format ai-sdk's `generateObject` consumes
  getAiSdkTools(): Record<string, ReturnType<typeof tool>> {
    const aiTools: Record<string, ReturnType<typeof tool>> = {};
    this.tools.forEach(t => {
      aiTools[t.name] = tool({
        description: t.description,
        parameters: t.parameters, // This is the Zod schema instance
        execute: t.execute.bind(t), // Bind 'this' if methods depend on tool instance state
      });
    });
    return aiTools;
  }
}

// Singleton instance of the registry
export const toolRegistry = new ToolRegistry();
