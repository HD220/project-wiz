export function ConversationMissingAgentWarning() {
  return (
    <div className="flex items-center justify-center bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
      ⚠️ Persona não encontrada para esta conversa.
    </div>
  );
}
