interface AddAgentModalHeaderProps {
  title?: string;
  description?: string;
}

export function AddAgentModalHeader({
  title = "Criar Novo Agente",
  description = "Configure um novo agente para seu projeto",
}: AddAgentModalHeaderProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
