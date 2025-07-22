import { UseFormReturn } from "react-hook-form";

import { Button } from "@/renderer/components/ui/button";
import { TestApiButton } from "./test-api-button";

import { type ProviderFormData } from "../constants";

interface EditProviderActionsSectionProps {
  form: UseFormReturn<ProviderFormData>;
  watchedType: string;
  watchedApiKey: string;
  isLoading: boolean;
  onClose: () => void;
}

function EditProviderActionsSection(props: EditProviderActionsSectionProps) {
  const { form, watchedType, watchedApiKey, isLoading, onClose } = props;

  return (
    <div className="flex items-center gap-3 pt-4">
      <TestApiButton
        data={{
          type: watchedType,
          apiKey: watchedApiKey,
          baseUrl: form.watch("baseUrl"),
        }}
        disabled={!watchedApiKey || isLoading}
        size="default"
      />

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
