import { Input } from "@/components/ui/input";
import { BaseField } from "../base-field";
import { createTextChangeHandler } from "../field-handlers";
import type { InputFieldProps } from "../field-types";

interface TextFieldProps extends InputFieldProps {
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "email" | "url" | "number" | "password";
  min?: string | number;
  max?: string | number;
  step?: string | number;
  transformer?: (value: string) => string;
}

export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  icon,
  required,
  type = "text",
  min,
  max,
  step,
  transformer,
}: TextFieldProps) {
  const handleChange = createTextChangeHandler(onChange, transformer);

  return (
    <BaseField id={id} label={label} icon={icon} required={required}>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
      />
    </BaseField>
  );
}
