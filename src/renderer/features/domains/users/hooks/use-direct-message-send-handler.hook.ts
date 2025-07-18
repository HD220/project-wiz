import type { DirectMessageSendProps } from "./use-direct-message-send.types";

interface CoreHooks {
  validateMessage: (content: string) => void;
  addOptimisticMessage: (content: string) => void;
  clearOptimisticMessages: () => void;
  sendToAgent: (content: string) => Promise<void>;
}

export function useDirectMessageSendHandler(
  props: DirectMessageSendProps,
  core: CoreHooks,
) {
  const sendMessage = async (content: string): Promise<void> => {
    core.validateMessage(content);
    props.setError(null);
    props.setIsSending(true);

    core.addOptimisticMessage(content);

    try {
      await core.sendToAgent(content);
      core.clearOptimisticMessages();
    } catch (err) {
      core.clearOptimisticMessages();
      handleSendError(err, props.setError);
    } finally {
      props.setIsSending(false);
    }
  };

  return { sendMessage };
}

function handleSendError(
  err: unknown,
  setError: (error: string | null) => void,
): void {
  const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";

  setError(errorMessage);
  console.error("Failed to send message to agent:", err);
  throw err;
}
