import { contextBridge, ipcRenderer } from "electron";
import { LLamaChatPromptOptions } from "node-llama-cpp";

contextBridge.exposeInMainWorld("electronAPI", {
  sendPrompt: (prompt: string, options?: LLamaChatPromptOptions) =>
    ipcRenderer.invoke("send-prompt", { prompt, options }),
  savePrompts: (options: {
    modelId: string;
    prompts: { [key: string]: string };
  }) => ipcRenderer.invoke("worker:savePrompts", options),
  loadPrompts: (options: { modelId: string }) =>
    ipcRenderer.invoke("worker:loadPrompts", options),
  getIssue: (owner: string, repo: string, issue_number: number) =>
    ipcRenderer.invoke("github:getIssue", { owner, repo, issue_number }),
});
