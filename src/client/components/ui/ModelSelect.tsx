import { ReactNode } from "react";
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface ModelOption {
  id: number | string;
  name: string;
  modelId: string;
  status: string;
}

interface ModelSelectProps {
  id: string;
  label: ReactNode;
  models: ModelOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export function ModelSelect({
  id,
  label,
  models,
  value,
  onChange,
  error,
  placeholder = "Select a model",
}: ModelSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {models
            .filter((model) => model.status === "downloaded")
            .map((model) => (
              <SelectItem key={model.modelId} value={model.modelId}>
                {model.name} ({model.modelId})
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default ModelSelect;