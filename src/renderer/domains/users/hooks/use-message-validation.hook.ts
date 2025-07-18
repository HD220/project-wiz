export function useMessageValidation() {
  const validateMessage = (content: string): void => {
    if (!content.trim()) {
      throw new Error("Mensagem não pode estar vazia");
    }
  };

  return { validateMessage };
}
