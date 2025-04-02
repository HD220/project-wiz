import { useCallback, useState } from "react";
import ModelItem from "./ModelItem.tsx";
import { ModelListProps } from "./types.ts";
import { Skeleton } from "../ui/skeleton.tsx";

// Dados de exemplo (pode ser removido em produção)
const sampleModels: ModelListProps["models"] = [
  {
    metadata: {
      id: "1",
      name: "Tiny Llama 1.1B",
      modelId: "hf://TinyLlama/TinyLlama-1.1B-Chat-v1.0/model.gguf",
      size: "1.1 GB",
      description:
        "Modelo pequeno e rápido para testes, com apenas 1.1B de parâmetros.",
    },
    state: {
      status: "not-downloaded",
      lastUsed: null,
      isActive: false,
    },
  },
  {
    metadata: {
      id: "2",
      name: "Phi-2",
      modelId: "hf://microsoft/phi-2/model.gguf",
      size: "2.7 GB",
      description: "Modelo de linguagem de 2.7B de parâmetros da Microsoft.",
    },
    state: {
      status: "not-downloaded",
      lastUsed: null,
      isActive: false,
    },
  },
];

export default function ModelList({
  models = sampleModels,
  isLoading = false,
  emptyMessage = "Nenhum modelo disponível",
  className = "",
}: Partial<ModelListProps>) {
  const [activeModelId, setActiveModelId] = useState<string | null>(null);

  const handleActivateModel = useCallback((modelId: string) => {
    setActiveModelId(modelId);
  }, []);

  if (isLoading) {
    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 ${className}`}
      >
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!models || models.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 ${className}`}
    >
      {models.map((model) => (
        <ModelItem
          key={model.metadata.id}
          model={{
            ...model,
            state: {
              ...model.state,
              isActive: model.metadata.modelId === activeModelId,
            },
          }}
          onActivate={handleActivateModel}
        />
      ))}
    </div>
  );
}
