import { ProviderNameField } from "./llm-provider-form-name-field";
import { ProviderField } from "./llm-provider-form-provider-field";
import { ModelField } from "./llm-provider-form-model-field";
import { ApiKeyField } from "./llm-provider-form-api-field";
import { DefaultField } from "./llm-provider-form-default-field";

interface FormData {
  name: string;
  provider: string;
  model: string;
  apiKey: string;
  isDefault: boolean;
}

interface LlmProviderFormFieldsProps {
  formData: FormData;
  selectedProvider: string;
  availableModels: string[];
  onFieldChange: (field: string, value: string | boolean) => void;
  onProviderChange: (value: string, models: string[]) => void;
}

export function LlmProviderFormFields({
  formData,
  selectedProvider,
  availableModels,
  onFieldChange,
  onProviderChange,
}: LlmProviderFormFieldsProps) {
  return (
    <div className="space-y-4">
      <ProviderNameField
        value={formData.name}
        onChange={(value) => onFieldChange("name", value)}
      />

      <ProviderField value={selectedProvider} onChange={onProviderChange} />

      <ModelField
        value={formData.model}
        availableModels={availableModels}
        onChange={(value) => onFieldChange("model", value)}
      />

      <ApiKeyField
        value={formData.apiKey}
        onChange={(value) => onFieldChange("apiKey", value)}
      />

      <DefaultField
        value={formData.isDefault}
        onChange={(value) => onFieldChange("isDefault", value)}
      />
    </div>
  );
}
