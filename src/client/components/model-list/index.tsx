import { useState } from "react";
import ModelCard from "../model-card";

export interface Model {
  id: string | number;
  name: string;
  modelId: string;
  size: string;
  status: "downloaded" | "not_downloaded" | "not-downloaded";
  lastUsed: string | null;
  description: string;
}

interface ModelListProps {
  models: Model[];
}

function normalizeStatus(status: string): "downloaded" | "not_downloaded" {
  if (status === "not-downloaded") return "not_downloaded";
  if (status === "downloaded") return "downloaded";
  return "not_downloaded";
}

export default function ModelList({ models }: ModelListProps) {
  const [activeModelId, setActiveModelId] = useState<string | number | null>(null);

  // Simulates model activation
  const handleActivateModel = (modelId: string | number) => {
    setActiveModelId(modelId);
    // In a real scenario, trigger activation logic here
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {models.map((model) => (
        <ModelCard
          key={String(model.id)}
          model={{
            id: String(model.id),
            description: model.description,
            modelId: model.modelId,
            name: model.name,
            size: model.size,
            state: {
              isActive: model.modelId === activeModelId,
              lastUsed: model.lastUsed,
              status: normalizeStatus(model.status),
            },
          }}
          onActivate={() => handleActivateModel(model.modelId)}
        />
      ))}
    </div>
  );
}
