import { ICommand } from "@/main/kernel/cqrs-dispatcher";
import { ApplicationError } from "@/main/errors/application.error";
import { FilesystemService } from "@/main/modules/filesystem-tools/domain/filesystem.service";

export class WriteFileCommand
  implements
    ICommand<{
      relativePath: string;
      content: string;
    }>
{
  readonly type = "WriteFileCommand";

  constructor(
    public readonly relativePath: string,
    public readonly content: string,
  ) {}

  get payload() {
    return { relativePath: this.relativePath, content: this.content };
  }
}

export class WriteFileCommandHandler {
  constructor(private filesystemService: FilesystemService) {}

  async handle(command: WriteFileCommand): Promise<void> {
    try {
      await this.filesystemService.writeFile(
        command.relativePath,
        command.content,
      );
    } catch (error: unknown) {
      console.error(`Failed to write file:`, error);
      throw new ApplicationError(`Failed to write file: ${(error as Error).message}`);
    }
  }
}
