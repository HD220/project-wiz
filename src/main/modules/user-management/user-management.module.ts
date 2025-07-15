import { BaseModule } from "../../kernel/base-module";

import { UserIpcHandlers } from "./ipc/handlers";

export class UserManagementModule extends BaseModule {
  private userIpcHandlers!: UserIpcHandlers;

  getName(): string {
    return "user-management";
  }

  getDependencies(): string[] {
    return []; // No dependencies
  }

  protected async onInitialize(): Promise<void> {
    this.userIpcHandlers = new UserIpcHandlers();
  }

  protected onRegisterIpcHandlers(): void {
    this.userIpcHandlers.registerHandlers();
  }
}