import { TableCell, TableRow } from "../../../components/ui/table";
import { LlmProviderActions } from "./llm-provider-actions";
import { LlmProviderDefaultButton } from "./llm-provider-default-button";
import type { LlmProviderDto } from "../../../../shared/types/domains/llm/llm-provider.types";

interface LlmProviderRowProps {
  provider: LlmProviderDto;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export function LlmProviderRow({
  provider,
  onDelete,
  onSetDefault,
}: LlmProviderRowProps) {
  return (
    <TableRow key={provider.id}>
      <TableCell className="font-medium">
        {provider.name}
        {provider.isDefault && (
          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
            Padrao
          </span>
        )}
      </TableCell>
      <TableCell>{provider.provider}</TableCell>
      <TableCell>{provider.model}</TableCell>
      <TableCell>
        <LlmProviderDefaultButton
          provider={provider}
          onSetDefault={onSetDefault}
        />
      </TableCell>
      <TableCell>
        <LlmProviderActions provider={provider} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  );
}
