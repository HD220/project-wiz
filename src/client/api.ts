import { ipcRenderer } from "electron";
import { GenerateOptions, ModelOptions } from "./hooks/use-llm";

export const loadModel = async (modelId: string): Promise<void> => {
  // TODO: Implementar comunicação IPC com WorkerService
  console.log(`Loading model: ${modelId}`);
  await ipcRenderer.invoke("load-model", { modelId });
};

export const unloadModel = async (): Promise<void> => {
  // TODO: Implementar comunicação IPC com WorkerService
  console.log("Unloading model");
  await ipcRenderer.invoke("unload-model");
};

export const generate = async (
  prompt: string,
  options?: GenerateOptions
): Promise<string> => {
  // TODO: Implementar comunicação IPC com WorkerService
  console.log(`Generating text from prompt: ${prompt}`);
  const result = await ipcRenderer.invoke("send-prompt", { prompt, options });
  return (result as any)?.response;
};

export const getAvailableModels = async (): Promise<string[]> => {
  // TODO: Implementar comunicação IPC com WorkerService
  console.log("Getting available models");
  return ["model1", "model2", "model3", "mistral"];
};

export const setOptions = (options: ModelOptions): void => {
  // TODO: Implementar lógica para configurar as opções do modelo
  console.log("Setting options", options);
};
