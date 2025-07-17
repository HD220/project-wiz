interface AddAgentFormErrorProps {
  error: string | null;
}

export function AddAgentFormError({ error }: AddAgentFormErrorProps) {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
      <p className="text-sm text-red-600">{error}</p>
    </div>
  );
}
