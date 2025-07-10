import { ipcMain } from "electron";

import { bootstrap } from "./bootstrap";
import { CqrsDispatcher } from "./kernel/cqrs-dispatcher";
import { EventBus } from "./kernel/event-bus";
import { db } from "./persistence/db";

import { registerForumModule } from "./modules/forum";
import { registerProjectManagementModule } from "./modules/project-management";
import { registerDirectMessagesModule } from "./modules/direct-messages";
import { registerUserSettingsModule } from "./modules/user-settings";
import { registerPersonaManagementModule } from "./modules/persona-management";
import { registerLlmIntegrationModule } from "./modules/llm-integration";
import { registerCodeAnalysisModule } from "./modules/code-analysis";
import { registerAutomaticPersonaHiringModule } from "./modules/automatic-persona-hiring";

export async function composeMainProcessHandlers() {
  const cqrsDispatcher = new CqrsDispatcher();
  const eventBus = new EventBus();
  await bootstrap(cqrsDispatcher, eventBus, db);

  registerForumModule(cqrsDispatcher);
  registerProjectManagementModule(cqrsDispatcher);
  registerDirectMessagesModule(cqrsDispatcher);
  registerUserSettingsModule(cqrsDispatcher);
  registerPersonaManagementModule(cqrsDispatcher);
  registerLlmIntegrationModule(cqrsDispatcher);
  registerCodeAnalysisModule(cqrsDispatcher);
  registerAutomaticPersonaHiringModule(cqrsDispatcher);
}
