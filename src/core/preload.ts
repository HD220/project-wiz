import { contextBridge, ipcRenderer } from "electron";
import { LlamaAPI } from "./electronAPI";
import { LlamaMessageType } from "./llama";

const { port1: llamaAPI, port2: llamaService } = new MessageChannel();

// Funções da API que serão expostas ao renderer
const electronAPI: LlamaAPI = {};

// Expor a API para o renderer
contextBridge.exposeInMainWorld("electronAPI", electronAPI);
