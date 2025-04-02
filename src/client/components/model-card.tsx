import { memo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { ModelStatusBadge } from "./model-card/ModelStatusBadge.js";
import { ModelActions } from "./model-card/ModelActions.js";
import type { ModelCardProps } from "./model-card/types.js";

function ModelCard({
  model,
  onActivate,
  onDownload,
  className,
}: ModelCardProps) {
  return (
    <Card className={model.state.isActive ? "border-primary" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{model.metadata.name}</CardTitle>
          <ModelStatusBadge
            status={model.state.status}
            isActive={model.state.isActive}
          />
        </div>
        <CardDescription>{model.metadata.modelId}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm">{model.metadata.description}</div>
        <div className="mt-2 text-xs text-muted-foreground">
          Size: {model.metadata.size}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <ModelActions
          status={model.state.status}
          isActive={model.state.isActive}
          modelId={model.metadata.modelId}
          onActivate={onActivate}
          onDownload={onDownload}
        />
      </CardFooter>
    </Card>
  );
}

export default memo(ModelCard);
