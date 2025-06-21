// src/infrastructure/ipc-services/ipc-llm-adapter.ts
import { LLMInterface, LLMResponse } from '../../core/ports/llm.interface'; // Adjusted path
import { Result, ok, error } from '../../shared/result'; // Result may not be directly applicable if interface returns Promise<LLMResponse | undefined>
import { DomainError } from '../../core/common/errors';
import { tool } from 'ai'; // For ReturnType<typeof tool>

// Placeholder for sendRequestToMain
declare function sendRequestToMain<T_REQ_PAYLOAD, T_RES_DATA>(type: string, payload: T_REQ_PAYLOAD): Promise<T_RES_DATA>;

// The actual LLMInterface does not wrap its response in Result<T>, so the IPC adapter also won't.
export class IPCLLMAdapter implements LLMInterface {
    async executeWithTools(
        prompt: string,
        tools: Array<ReturnType<typeof tool>> // Assuming this can be serialized over IPC
    ): Promise<LLMResponse | undefined> {
        try {
            // Note: The 'ai' package's `tool` type might be complex.
            // Serialization over IPC needs to be handled carefully.
            // For now, we assume it's serializable directly or via a custom transformation if needed.
            const responseData = await sendRequestToMain<
                { prompt: string; tools: Array<ReturnType<typeof tool>> },
                LLMResponse | undefined
            >('LLM_ADAPTER_EXECUTE_WITH_TOOLS', { prompt, tools });

            return responseData; // Directly return what main process sends
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            // How to propagate errors if the interface doesn't use Result<T>?
            // Option 1: Throw the error, expecting the caller in the worker to catch it.
            // Option 2: Log and return undefined or a specific error structure if LLMResponse could carry it.
            // For now, let's throw, as it's a common way to signal operational failure.
            console.error(`IPCLLMAdapter.executeWithTools failed: ${err.message}`);
            throw new DomainError(`IPCLLMAdapter.executeWithTools failed: ${err.message}`);
        }
    }
}
