import { Button } from "@/renderer/components/ui/button";

import { TestApiButton } from "./test-api-button";

interface ProviderFormActionsProps {
  watchedType: "openai" | "deepseek" | "anthropic" | "google" | "custom";
  watchedApiKey: string;
  baseUrl?: string;
  isLoading: boolean;
  isEditing: boolean;
  onClose: () => void;
}

function ProviderFormActions(props: ProviderFormActionsProps) {
  const { watchedType, watchedApiKey, baseUrl, isLoading, isEditing, onClose } =
    props;

  return (
    <div className="flex items-center gap-3 pt-2">
      <TestApiButton
        data={{
          type: watchedType,
          apiKey: watchedApiKey,
          baseUrl,
        }}
        disabled={!watchedApiKey || isLoading}
        size="default"
      />

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
