import { useState, useEffect } from "react";
import ModelCard from "../model-card";

interface Model {
  id: string;
  name: string;
  modelId: string;
  size: string;
  status: 'downloaded' | 'not_downloaded';
  lastUsed: string | null;
  description: string;
}

// Modelo simples para teste
const sampleModels: Model[] = [
  {
    id: '1',
    name: "Tiny Llama 1.1B",
    modelId: "hf://TinyLlama/TinyLlama-1.1B-Chat-v1.0/model.gguf",
    size: "1.1 GB",
    status: "not_downloaded",
    lastUsed: null,
    description:
      "Modelo pequeno e rápido para testes, com apenas 1.1B de parâmetros.",
  },
  {
    id: '2',
    name: "Phi-2",
    modelId: "hf://microsoft/phi-2/model.gguf",
    size: "2.7 GB",
    status: "not_downloaded",
    lastUsed: null,
    description:
      "Modelo de linguagem de 2.7B de parâmetros da Microsoft, com bom desempenho em tarefas de raciocínio.",
  },
  {
    id: '3',
    name: "Mistral 7B Instruct v0.2",
    modelId: "Mistral-7B-Instruct-v0.2.gguf",
    size: "4.1 GB",
    status: "downloaded",
    lastUsed: "2025-03-25T14:30:00",
    description:
      "Modelo de 7B de parâmetros com excelente desempenho em tarefas de instrução.",
  },
];

export default function ModelList() {
  const [models, setModels] = useState<Model[]>(sampleModels);
  const [activeModelId, setActiveModelId] = useState<string | null>(null);

  // Simula a ativação de um modelo
  const handleActivateModel = (modelId: string) => {
    setActiveModelId(modelId);

    // Atualiza o status do modelo para "downloaded" se não estiver
    setModels(
      models.map((model) =>
        model.modelId === modelId
          ? {
              ...model,
              status: "downloaded",
              lastUsed: new Date().toISOString(),
            }
          : model
      )
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {models.map((model) => (
        <ModelCard
          model={{
            id: model.id,
            description: model.description,
            modelId: model.modelId,
            name: model.name,
            size: model.size,
            state: {isActive: model.modelId === activeModelId,lastUsed: model.lastUsed, status: model.status}
          }}
          onActivate={handleActivateModel}
        />
      ))}
    </div>
  );
}
