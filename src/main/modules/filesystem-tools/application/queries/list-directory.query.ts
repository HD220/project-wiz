import { IQuery } from "@/main/kernel/cqrs-dispatcher";
import { FilesystemService } from "@/main/modules/filesystem-tools/domain/filesystem.service";

export class ListDirectoryQuery
  implements
    IQuery<{
      relativePath: string;
    }>
{
  readonly type = "ListDirectoryQuery";

  constructor(public readonly relativePath: string) {}

  get payload() {
    return { relativePath: this.relativePath };
  }
}

export class ListDirectoryQueryHandler {
  constructor(private filesystemService: FilesystemService) {}

  async handle(query: ListDirectoryQuery): Promise<string[]> {
    try {
      return await this.filesystemService.listDirectory(query.relativePath);
    } catch (error: unknown) {
      console.error(`Failed to list directory:`, error);
      throw new Error(`Failed to list directory: ${(error as Error).message}`);
    }
  }
}
