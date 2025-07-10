import { IQuery } from "@/main/kernel/cqrs-dispatcher";
import { FilesystemService } from "@/main/modules/filesystem-tools/filesystem.service";

export class ReadFileQuery
  implements
    IQuery<{
      relativePath: string;
    }>
{
  readonly type = "ReadFileQuery";

  constructor(public readonly relativePath: string) {}

  get payload() {
    return { relativePath: this.relativePath };
  }
}

export class ReadFileQueryHandler {
  constructor(private filesystemService: FilesystemService) {}

  async handle(query: ReadFileQuery): Promise<string> {
    try {
      return await this.filesystemService.readFile(query.relativePath);
    } catch (error: unknown) {
      console.error(`Failed to read file:`, error);
      throw new Error(`Failed to read file: ${(error as Error).message}`);
    }
  }
}
