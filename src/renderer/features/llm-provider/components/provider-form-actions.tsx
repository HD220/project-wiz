import { Button } from "@/renderer/components/ui/button";

interface ProviderFormActionsProps {
  isLoading: boolean;
  isEditing: boolean;
  onClose: () => void;
}

function ProviderFormActions(props: ProviderFormActionsProps) {
  const { isLoading, isEditing, onClose } = props;

  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="flex-1" />

      <Button variant="outline" onClick={onClose} disabled={isLoading}>
        Cancel
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
      </Button>
    </div>
  );
}

export { ProviderFormActions };
