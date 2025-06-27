// src_refactored/presentation/electron/main/ipc-chat.handlers.ts
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { IPCChannel } from '@/shared/ipc-channels'; // Adjust path as necessary
import { ChatSendMessagePayload, ChatStreamEventPayload, ChatStreamTokenPayload, ChatStreamEndPayload, ChatStreamErrorPayload } from '@/shared/ipc-chat.types'; // Adjust path
import { LanguageModelMessage } from '@/core/ports/adapters/llm-adapter.types'; // Adjust path
import { ILLMAdapter, ILLMAdapterToken } from '@/core/ports/adapters/llm-adapter.interface'; // Adjust path
import { appContainer } from '@/infrastructure/ioc/inversify.config'; // Assuming DI container is set up

// Placeholder for a more sophisticated ChatService
// For now, this handler will directly use the ILLMAdapter.
// In a real app, this logic would likely be in an application service.

export function registerChatIPCHandlers(): void {
  ipcMain.handle(IPCChannel.CHAT_SEND_MESSAGE, async (event: IpcMainInvokeEvent, payload: ChatSendMessagePayload) => {
    console.log(`[IPC Chat Handler] Received ${IPCChannel.CHAT_SEND_MESSAGE}`, payload);

    // TODO: Get ILLMAdapter from DI container if available
    // For now, this is a placeholder. In a real setup, you'd resolve this from your DI container.
    let llmAdapter: ILLMAdapter | null = null;
    try {
        // This assumes ILLMAdapterToken is correctly bound in your InversifyJS (or other DI) setup for the main process.
        // If DI is not set up for main process or this specific adapter, this will fail or needs alternative.
        if (appContainer.isBound(ILLMAdapterToken)) {
             llmAdapter = appContainer.get<ILLMAdapter>(ILLMAdapterToken);
        } else {
            console.warn('[IPC Chat Handler] ILLMAdapterToken not bound in DI container. Chat streaming will be mocked/limited.');
        }
    } catch (diError) {
        console.error('[IPC Chat Handler] Error resolving ILLMAdapter from DI container:', diError);
    }


    // Simulate streaming response
    const sendStreamEvent = (streamPayload: ChatStreamEventPayload) => {
      if (!event.sender.isDestroyed()) {
        event.sender.send(IPCChannel.CHAT_STREAM_EVENT, streamPayload);
      }
    };

    if (llmAdapter && payload.messages) {
        try {
            // Assuming streamText exists and is implemented by the adapter
            if (typeof llmAdapter.streamText !== 'function') {
                throw new Error('LLMAdapter does not support streamText method.');
            }

            // Minimal prompt for demonstration if messages are empty or just a system message
            let effectiveMessages = payload.messages;
            if (effectiveMessages.length === 0 || (effectiveMessages.length === 1 && effectiveMessages[0].role === 'system')) {
                effectiveMessages.push({ role: 'user', content: 'Hello!' });
            }

            // Convert LanguageModelMessage[] to a simple prompt string for streamText
            // This is a simplification; a real implementation might pass messages directly
            // or have the adapter handle the message array.
            const simplePrompt = effectiveMessages.map(m => `${m.role}: ${m.content}`).join('\\n');

            const stream = llmAdapter.streamText(simplePrompt); // Or adapt to use messages if streamText supports it

            for await (const result of stream) {
                if (result.isSuccess()) {
                    const tokenPayload: ChatStreamTokenPayload = { type: 'token', data: result.value };
                    sendStreamEvent(tokenPayload);
                } else {
                    console.error('[IPC Chat Handler] Error from LLM stream:', result.error);
                    const errorPayload: ChatStreamErrorPayload = { type: 'error', error: { message: result.error.message, name: result.error.name }};
                    sendStreamEvent(errorPayload);
                    // Optionally, break or handle differently
                }
            }
            const endPayload: ChatStreamEndPayload = { type: 'end' };
            sendStreamEvent(endPayload);

            // For invoke, we need to return a promise.
            // The actual "result" of sendMessage might be an acknowledgement or initial status.
            // Streaming happens via event.sender.send.
            return { success: true, data: { message: "Message received, streaming started." } };

        } catch (error: any) {
            console.error('[IPC Chat Handler] Error processing stream with LLMAdapter:', error);
            const errorPayload: ChatStreamErrorPayload = { type: 'error', error: { message: error.message || 'Failed to process stream' }};
            sendStreamEvent(errorPayload);
            const endPayload: ChatStreamEndPayload = { type: 'end' }; // Ensure stream ends even on error
            sendStreamEvent(endPayload);
            return { success: false, error: { message: error.message || 'Failed to process stream with LLMAdapter' } };
        }
    } else {
        // Fallback mock streaming if no LLM adapter or no messages
        console.warn('[IPC Chat Handler] Using mock stream response.');
        const mockMessage = "This is a mock streamed response from the main process. ";
        const tokens = mockMessage.split(' ');
        let delay = 0;
        for (const token of tokens) {
            delay += 100;
            setTimeout(() => {
                const tokenPayload: ChatStreamTokenPayload = { type: 'token', data: token + " " };
                sendStreamEvent(tokenPayload);
            }, delay);
        }
        setTimeout(() => {
            const endPayload: ChatStreamEndPayload = { type: 'end' };
            sendStreamEvent(endPayload);
        }, delay + 100);
        return { success: true, data: { message: "Message received, mock streaming started." } };
    }
  });

  console.log('[IPC Chat Handler] Chat IPC handlers registered.');
}

// To unregister (optional, if needed during app lifecycle, e.g., for testing or module unloading)
export function unregisterChatIPCHandlers(): void {
  ipcMain.removeHandler(IPCChannel.CHAT_SEND_MESSAGE);
  console.log('[IPC Chat Handler] Chat IPC handlers unregistered.');
}
