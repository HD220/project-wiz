import { ITool, ToolOutput, ToolInputParameters } from '@/core/application/ports/tool.interface';
import { z, ZodSchema } from 'zod';

export const FileSystemListToolInputSchema = z.object({
  path: z.string().describe("The directory path to list. Defaults to current directory if not provided."),
  // recursive: z.boolean().optional().default(false).describe("Whether to list recursively.") // Future enhancement
});
export type FileSystemListToolInput = z.infer<typeof FileSystemListToolInputSchema>;

export class FileSystemListTool implements ITool<FileSystemListToolInput> {
  public readonly name = "fileSystemListTool";
  public readonly description = "Lists files and directories at a given path. (Currently mock implementation)";
  public readonly parametersSchema: ZodSchema<FileSystemListToolInput> = FileSystemListToolInputSchema;

  async execute(args: FileSystemListToolInput, agentId?: string): Promise<ToolOutput> {
    console.log(`FileSystemListTool called by agent ${agentId || 'Unknown'} with path: ${args.path}`);

    // Mock implementation: returns a predefined list
    const mockFiles = [
      { name: "file1.txt", type: "file", path: `${args.path}/file1.txt` },
      { name: "file2.ts", type: "file", path: `${args.path}/file2.ts` },
      { name: "subdirectory", type: "directory", path: `${args.path}/subdirectory` },
    ];

    // In a real tool, you would use 'node:fs/promises' to interact with the filesystem.
    // e.g., await fs.readdir(args.path, { withFileTypes: true });
    // And then map the results.
    // Handle errors appropriately (path not found, permissions, etc.)

    return {
      success: true,
      result: {
        path: args.path,
        entries: mockFiles,
      },
    };
  }
}
