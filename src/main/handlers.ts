import { ipcMain } from "electron";

import { bootstrap } from "./bootstrap";



import { registerForumHandlers } from "./modules/forum/ipc-handlers";
import { registerProjectManagementHandlers } from "./modules/project-management/ipc-handlers";
import { registerDirectMessagesHandlers } from "./modules/direct-messages/ipc-handlers";
import { registerUserSettingsHandlers } from "./modules/user-settings/ipc-handlers";
import { registerPersonaManagementHandlers } from "./modules/persona-management/ipc-handlers";
import { registerLlmIntegrationHandlers } from "./modules/llm-integration/ipc-handlers";
import { registerCodeAnalysisHandlers } from "./modules/code-analysis/ipc-handlers";
import { registerAutomaticPersonaHiringHandlers } from "./modules/automatic-persona-hiring/ipc-handlers";



export async function composeMainProcessHandlers() {
  const { cqrsDispatcher } = await bootstrap();

  

  

  
  registerForumHandlers(cqrsDispatcher);
  registerProjectManagementHandlers(cqrsDispatcher);
  registerDirectMessagesHandlers(cqrsDispatcher);
  registerUserSettingsHandlers(cqrsDispatcher);
  registerPersonaManagementHandlers(cqrsDispatcher);
  registerLlmIntegrationHandlers(cqrsDispatcher);
  registerCodeAnalysisHandlers(cqrsDispatcher);
  registerAutomaticPersonaHiringHandlers(cqrsDispatcher);
}
