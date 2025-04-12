import { useEffect, useState } from "react";
import { ipcAvailableModelsServiceAdapter, AvailableModel } from "../services/ipc-available-models-service-adapter";

export function useAvailableModels() {
  const [models, setModels] = useState<AvailableModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    ipcAvailableModelsServiceAdapter
      .getAvailableModels()
      .then((data) => {
        if (isMounted) {
          setModels(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError("Failed to fetch available models.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { models, loading, error };
}