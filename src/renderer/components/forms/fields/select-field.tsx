import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BaseField } from "../base-field";
import type { InputFieldProps, SelectOption } from "../field-types";

interface SelectFieldProps extends InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  icon,
  required,
}: SelectFieldProps) {
  return (
    <BaseField id={id} label={label} icon={icon} required={required}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </BaseField>
  );
}
