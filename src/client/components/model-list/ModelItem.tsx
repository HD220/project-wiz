import { memo } from "react";
import { ModelItemProps } from "./types";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const ModelItem = memo(({ model, onActivate }: ModelItemProps) => {
  const { metadata, state } = model;
  const { id, name, modelId, size, description } = metadata;
  const { status, isActive, lastUsed } = state;

  return (
    <div className="border rounded-lg p-4 flex flex-col gap-2 h-full">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-lg">{name}</h3>
        <Badge variant={status === "downloaded" ? "default" : "secondary"}>
          {status === "downloaded" ? "Baixado" : "Não baixado"}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">{description}</p>
      <p className="text-sm mt-2">Tamanho: {size}</p>

      {lastUsed && (
        <p className="text-xs text-muted-foreground">
          Último uso: {new Date(lastUsed).toLocaleDateString()}
        </p>
      )}

      <div className="mt-auto pt-2">
        <Button
          variant={isActive ? "default" : "outline"}
          size="sm"
          onClick={() => onActivate?.(modelId)}
          disabled={status === "not-downloaded"}
        >
          {isActive ? "Ativo" : "Ativar"}
        </Button>
      </div>
    </div>
  );
});

ModelItem.displayName = "ModelItem";

export default ModelItem;
