import { useState, useEffect } from "react";

import { LlmProviderDto } from "../../../../shared/types/domains/llm/llm-provider.types";

interface FormData {
  name: string;
  provider: string;
  model: string;
  apiKey: string;
  isDefault: boolean;
}

export function useLlmProviderForm(provider: LlmProviderDto | null) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    provider: "",
    model: "",
    apiKey: "",
    isDefault: false,
  });
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name,
        provider: provider.provider,
        model: provider.model,
        apiKey: provider.apiKey,
        isDefault: provider.isDefault,
      });
      setSelectedProvider(provider.provider);
    } else {
      setFormData({
        name: "",
        provider: "",
        model: "",
        apiKey: "",
        isDefault: false,
      });
      setSelectedProvider("");
      setAvailableModels([]);
    }
  }, [provider]);

  const handleFieldChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProviderChange = (value: string, models: string[]) => {
    setSelectedProvider(value);
    setFormData((prev) => ({ ...prev, provider: value, model: "" }));
    setAvailableModels(models);
  };

  return {
    formData,
    selectedProvider,
    availableModels,
    handleFieldChange,
    handleProviderChange,
  };
}
