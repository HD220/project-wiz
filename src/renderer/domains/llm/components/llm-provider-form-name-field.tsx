import { TextField } from "@/components/forms/form-fields";
import { fieldTransformers } from "@/components/forms/field-transformers";

interface ProviderNameFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProviderNameField({ value, onChange }: ProviderNameFieldProps) {
  return (
    <TextField
      id="name"
      label="Name"
      value={value}
      onChange={onChange}
      placeholder="My AI Provider"
      transformer={fieldTransformers.normalizeText}
      required
    />
  );
}
