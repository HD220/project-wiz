import { Star, StarOff } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { LlmProviderDto } from "../../../../shared/types/domains/llm/llm-provider.types";

interface LlmProviderDefaultButtonProps {
  provider: LlmProviderDto;
  onSetDefault: (id: string) => void;
}

export function LlmProviderDefaultButton({
  provider,
  onSetDefault,
}: LlmProviderDefaultButtonProps) {
  return (
    <Button
      variant={provider.isDefault ? "default" : "outline"}
      size="sm"
      onClick={() => onSetDefault(provider.id)}
      disabled={provider.isDefault}
      className="flex items-center gap-1"
    >
      {provider.isDefault ? (
        <Star className="w-3 h-3 fill-current" />
      ) : (
        <StarOff className="w-3 h-3" />
      )}
      {provider.isDefault ? "Padrao" : "Definir como padrao"}
    </Button>
  );
}
