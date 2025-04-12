import { useEffect, useState } from "react";

export interface AvailableModel {
  id: number;
  name: string;
  modelId: string;
  size: string;
  status: string;
  lastUsed: string | null;
  description: string;
}

export function useAvailableModels() {
  const [models, setModels] = useState<AvailableModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Replace with real fetch from domain/infrastructure
    setTimeout(() => {
      setModels([
        {
          id: 1,
          name: "Mistral 7B",
          modelId: "mistralai/Mistral-7B-v0.1",
          size: "7B parameters",
          status: "downloaded",
          lastUsed: "2023-06-15T10:42:00",
          description: "A powerful 7B parameter model with strong coding capabilities.",
        },
        {
          id: 2,
          name: "Llama 2 7B",
          modelId: "meta-llama/Llama-2-7b-hf",
          size: "7B parameters",
          status: "downloaded",
          lastUsed: "2023-06-14T15:30:00",
          description: "Meta's Llama 2 model with 7B parameters, good for general tasks.",
        },
        {
          id: 3,
          name: "CodeLlama 7B",
          modelId: "codellama/CodeLlama-7b-hf",
          size: "7B parameters",
          status: "not-downloaded",
          lastUsed: null,
          description: "Specialized model for code generation and understanding.",
        },
        {
          id: 4,
          name: "Phi-2",
          modelId: "microsoft/phi-2",
          size: "2.7B parameters",
          status: "downloaded",
          lastUsed: "2023-06-10T09:15:00",
          description: "Smaller but efficient model from Microsoft, good for lightweight tasks.",
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return { models, loading, error };
}