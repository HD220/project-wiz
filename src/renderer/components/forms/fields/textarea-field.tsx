import { Textarea } from "@/components/ui/textarea";
import { BaseField } from "../base-field";
import { createTextareaChangeHandler } from "../field-handlers";
import type { InputFieldProps } from "../field-types";

interface TextAreaFieldProps extends InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}

export function TextAreaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  icon,
  required,
  rows = 3,
}: TextAreaFieldProps) {
  const handleChange = createTextareaChangeHandler(onChange);

  return (
    <BaseField id={id} label={label} icon={icon} required={required}>
      <Textarea
        id={id}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
      />
    </BaseField>
  );
}
