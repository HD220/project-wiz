export type LlamaUtilityMessage = 
  | { type: 'log'; level: string; message: string }
  | { type: 'downloadProgress'; progress: number }
  | { type: 'loadProgress'; progress: number }
  | { type: 'stateChange'; state: string }
  | { type: 'textChunk'; text: string }
  | { type: 'ready' }
  | { type: 'response'; response: string }
  | { type: 'error'; error: string }
  | { type: 'init' }
  | { type: 'prompt'; prompt: string };
