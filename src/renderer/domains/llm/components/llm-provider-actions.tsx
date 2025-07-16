import { Link } from "@tanstack/react-router";
import { Button } from "../../../components/ui/button";
import type { LlmProviderDto } from "../../../../shared/types/domains/llm/llm-provider.types";

interface LlmProviderActionsProps {
  provider: LlmProviderDto;
  onDelete: (id: string) => void;
}

export function LlmProviderActions({
  provider,
  onDelete,
}: LlmProviderActionsProps) {
  return (
    <div className="flex gap-2">
      <Link
        to="/settings/edit-llm-provider/$llmProviderId"
        params={{ llmProviderId: provider.id }}
      >
        <Button variant="outline" size="sm">
          Editar
        </Button>
      </Link>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onDelete(provider.id)}
        disabled={provider.isDefault}
      >
        Excluir
      </Button>
    </div>
  );
}
