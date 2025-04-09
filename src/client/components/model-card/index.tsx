import { memo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { ModelStatusBadge } from "./ModelStatusBadge.js";
import { ModelActions } from "./ModelActions.js";
import { ModelCardActions } from "./types.js";

function ModelCard({ model, onActivate, onDownload }: ModelCardActions) {
  return (
    <Card className={model.state.isActive ? "border-primary" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{model.name}</CardTitle>
          <ModelStatusBadge
            status={model.state.status}
            isActive={model.state.isActive}
          />
        </div>
        <CardDescription>{model.modelId}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm">{model.description}</div>
        <div className="mt-2 text-xs text-muted-foreground">
          Size: {model.size}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <ModelActions
          model={model}
          onActivate={onActivate}
          onDownload={onDownload}
        />
      </CardFooter>
    </Card>
  );
}

export default memo(ModelCard);
