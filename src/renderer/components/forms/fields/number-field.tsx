import { Input } from "@/components/ui/input";
import { BaseField } from "../base-field";
import { createNumberChangeHandler } from "../field-handlers";
import type { InputFieldProps } from "../field-types";

interface NumberFieldProps extends InputFieldProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  placeholder,
  icon,
  required,
  min,
  max,
  step,
}: NumberFieldProps) {
  const handleChange = createNumberChangeHandler(onChange);

  return (
    <BaseField id={id} label={label} icon={icon} required={required}>
      <Input
        id={id}
        type="number"
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
