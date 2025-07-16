import { ModelField as BaseModelField } from "@/components/forms/form-fields";

interface ModelFieldProps {
  value: string;
  availableModels: string[];
  onChange: (value: string) => void;
}

export function ModelField({
  value,
  availableModels,
  onChange,
}: ModelFieldProps) {
  return (
    <BaseModelField
      id="model"
      label="Model"
      value={value}
      onChange={onChange}
      availableModels={availableModels}
      selectPlaceholder="Select a model"
      customPlaceholder="Enter custom model name"
      required
    />
  );
}
