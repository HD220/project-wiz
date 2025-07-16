import { TextField } from "@/components/forms/form-fields";

interface ApiKeyFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function ApiKeyField({ value, onChange }: ApiKeyFieldProps) {
  return (
    <TextField
      id="apiKey"
      label="API Key"
      type="password"
      value={value}
      onChange={onChange}
      placeholder="sk-..."
      required
    />
  );
}
