import { Button } from "@/renderer/components/ui/button";

interface AgentFormActionsProps {
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

function AgentFormActions(props: AgentFormActionsProps) {
  const { onCancel, isLoading, isEditing } = props;

  return (
    <div className="flex items-center gap-3 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : isEditing ? "Update Agent" : "Create Agent"}
      </Button>
    </div>
  );
}

export { AgentFormActions };
