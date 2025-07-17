import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BaseField } from "../base-field";
import type { InputFieldProps } from "../field-types";

interface ModelFieldProps extends InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  availableModels?: string[];
  customPlaceholder?: string;
  selectPlaceholder?: string;
}

function ModelSelectField({
  id,
  value,
  onChange,
  availableModels,
  selectPlaceholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  availableModels: string[];
  selectPlaceholder: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={selectPlaceholder} />
      </SelectTrigger>
      <SelectContent>
        {availableModels.map((model) => (
          <SelectItem key={model} value={model}>
            {model}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ModelInputField({
  id,
  value,
  onChange,
  customPlaceholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  customPlaceholder: string;
}) {
  return (
    <Input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={customPlaceholder}
    />
  );
}

export function ModelField({
  id,
  label,
  value,
  onChange,
  availableModels = [],
  customPlaceholder = "Enter custom model name",
  selectPlaceholder = "Select a model",
  icon,
  required,
}: ModelFieldProps) {
  const hasAvailableModels = availableModels.length > 0;

  return (
    <BaseField id={id} label={label} icon={icon} required={required}>
      {hasAvailableModels ? (
        <ModelSelectField
          id={id}
          value={value}
          onChange={onChange}
          availableModels={availableModels}
          selectPlaceholder={selectPlaceholder}
        />
      ) : (
        <ModelInputField
          id={id}
          value={value}
          onChange={onChange}
          customPlaceholder={customPlaceholder}
        />
      )}
    </BaseField>
  );
}
