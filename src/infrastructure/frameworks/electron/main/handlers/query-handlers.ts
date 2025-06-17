import { ok, error } from "@/shared/result";
import type { IpcChannels } from "@/core/application/ports/ipc-channels";
import { ElectronIpcHandler } from "../../electron-ipc.adapter";
import { UserQuery } from "@/core/application/queries/user.query";
import { LLMProviderQuery } from "@/core/application/queries/llm-provider.query";

export function registerQueryHandlers(
  ipcHandler: ElectronIpcHandler,
  userQuery: UserQuery,
  llmProviderQuery: LLMProviderQuery
) {
  ipcHandler.handle<
    IpcChannels["query:get-user"]["request"],
    IpcChannels["query:get-user"]["response"]
  >("query:get-user", async () => {
    try {
      const result = await userQuery.execute();
      return ok(result);
    } catch (_err) {
      // Renomeado para _err
      return error("Failed to get users");
    }
  });

  ipcHandler.handle<
    IpcChannels["query:llm-provider"]["request"],
    IpcChannels["query:llm-provider"]["response"]
  >("query:llm-provider", async () => {
    try {
      const result = await llmProviderQuery.execute(undefined); // Corrigido para passar undefined
      return ok(result);
    } catch (_err) {
      // Renomeado para _err
      return error("Failed to get LLM providers");
    }
  });
}
