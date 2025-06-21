import { Job } from "./interfaces/job.interface";
import { Tool } from "./interfaces/tool.interface";

export abstract class Agent {
  protected tools: Tool[] = [];

  constructor() {}

  registerTool(tool: Tool): void {
    this.tools.push(tool);
  }

  getTools(): Tool[] {
    return [...this.tools];
  }

  abstract process(job: Job): Promise<any>;

  protected async executeTool(toolName: string, params: any): Promise<any> {
    const tool = this.tools.find((t) => t.name === toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }
    return tool.execute(params);
  }
}
