import { ITool, ToolOutput, ToolInputParameters } from '@/core/application/ports/tool.interface';
import { z, ZodSchema } from 'zod';

// Define specific input schema for this tool
export const SimpleEchoToolInputSchema = z.object({
  message: z.string().describe("The message to echo back."),
  repeatCount: z.number().optional().default(1).describe("Number of times to repeat the message.")
});
export type SimpleEchoToolInput = z.infer<typeof SimpleEchoToolInputSchema>;

export class SimpleEchoTool implements ITool<SimpleEchoToolInput> {
  public readonly name = "simpleEchoTool";
  public readonly description = "A simple tool that echoes back the provided message, optionally repeating it.";
  public readonly parametersSchema: ZodSchema<SimpleEchoToolInput> = SimpleEchoToolInputSchema;

  async execute(args: SimpleEchoToolInput, agentId?: string): Promise<ToolOutput> {
    console.log(`SimpleEchoTool called by agent ${agentId || 'Unknown'} with args:`, args);
    let echoedMessage = "";
    for (let i = 0; i < args.repeatCount; i++) {
      echoedMessage += args.message + (args.repeatCount > 1 ? ` (repetition ${i+1})` : "");
      if (args.repeatCount > 1 && i < args.repeatCount - 1) {
        echoedMessage += "\\n";
      }
    }
    return {
      success: true,
      result: { echoedMessage: echoedMessage },
    };
  }
}
