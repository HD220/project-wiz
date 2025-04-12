import { ReactNode } from "react";
import { useLingui } from "@lingui/react";
import { i18n } from "../../client/i18n";
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
  placeholder,
}: ModelSelectProps) {
  useLingui(); // Ensure re-render on locale change

  const resolvedPlaceholder =
    placeholder ??
    i18n._("modelSelect.placeholder", {
      message: "Select a model",
    });

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        >
          <SelectValue placeholder={resolvedPlaceholder} />
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