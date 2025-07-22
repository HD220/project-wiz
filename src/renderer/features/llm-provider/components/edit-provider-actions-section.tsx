import { Button } from "@/renderer/components/ui/button";

interface EditProviderActionsSectionProps {
  isLoading: boolean;
  onClose: () => void;
}

function EditProviderActionsSection(props: EditProviderActionsSectionProps) {
  const { isLoading, onClose } = props;

  return (
    <div className="flex items-center gap-3 pt-4">
      <div className="flex-1" />

      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Updating..." : "Update Provider"}
      </Button>
    </div>
  );
}

export { EditProviderActionsSection };
