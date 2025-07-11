import { ICommand } from "@/main/kernel/cqrs-dispatcher";

export class CreateProjectCommand implements ICommand {
  readonly type = "CreateProjectCommand";

  constructor(public readonly payload: { name: string; localPath: string; remoteUrl?: string }) {}
}