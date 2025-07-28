import { Loader2, CheckCircle2 } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import { cn } from "@/renderer/lib/utils";

interface EditProviderActionsSectionProps {
  isLoading: boolean;
  onClose: () => void;
}

export function EditProviderActionsSection(
  props: EditProviderActionsSectionProps,
) {
  const { isLoading, onClose } = props;

  return (
    <div className="flex items-center gap-[var(--spacing-component-md)] pt-[var(--spacing-component-lg)] border-t border-border/40">
      <div className="flex-1" />

      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isLoading}
        className="hover:bg-accent/50 transition-colors"
      >
        Cancel
      </Button>

      <Button
        type="submit"
        disabled={isLoading}
        className={cn(
          "gap-[var(--spacing-component-sm)] shadow-sm",
          "bg-gradient-to-r from-primary to-primary/90",
          "hover:from-primary/90 hover:to-primary/80",
          "transition-all duration-200 hover:shadow-md hover:scale-[1.01]",
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <CheckCircle2 className="size-4" />
            Update Provider
          </>
        )}
      </Button>
    </div>
  );
}
