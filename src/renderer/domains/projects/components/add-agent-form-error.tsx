interface AddAgentFormErrorProps {
  error: string | null;
}

export function AddAgentFormError({ error }: AddAgentFormErrorProps) {
  if (!error) {
    return null;
  }

  return <div className="text-destructive text-sm mt-4">{error}</div>;
}
