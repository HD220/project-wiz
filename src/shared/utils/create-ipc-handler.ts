import { z } from 'zod'
import { IpcMainInvokeEvent } from 'electron'

export function createIPCHandler<TInput, TOutput>(config: {
  inputSchema: z.ZodSchema<TInput>
  outputSchema: z.ZodSchema<TOutput>
  handler: (input: TInput, event: IpcMainInvokeEvent) => Promise<TOutput>
}) {
  return async (
    data: unknown, 
    event: IpcMainInvokeEvent
  ): Promise<{ success: true; data: TOutput } | { success: false; error: string }> => {
    try {
      // 1. Parse e validação do input
      const parsedInput = config.inputSchema.parse(data)
      
      // 2. Executar handler com input validado
      const result = await config.handler(parsedInput, event)
      
      // 3. Parse e validação do output
      const validatedOutput = config.outputSchema.parse(result)
      
      // 4. Wrapper de sucesso
      return { success: true, data: validatedOutput }
    } catch (error) {
      // 5. Wrapper de erro consistente
      if (error instanceof z.ZodError) {
        return { success: false, error: `Validation: ${error.errors[0].message}` }
      }
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
}

// Type helper que infere o tipo correto do wrapper
export type InferHandler<T> = T extends ReturnType<typeof createIPCHandler<infer I, infer O>>
  ? (input: I) => Promise<{ success: true; data: O } | { success: false; error: string }>
  : never