
export interface ILLMAdapter {
  generate(prompt: string): Promise<string>;
}
