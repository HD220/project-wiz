import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { BaseField } from "./base-field";

import type { LucideIcon } from "lucide-react";

interface TextFieldProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: LucideIcon;
  required?: boolean;
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = transformer ? transformer(e.target.value) : e.target.value;
    onChange(newValue);
  };

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

interface TextAreaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: LucideIcon;
  required?: boolean;
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
  return (
    <BaseField id={id} label={label} icon={icon} required={required}>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
    </BaseField>
  );
}

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  icon?: LucideIcon;
  required?: boolean;
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

interface CheckboxFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: LucideIcon;
}

export function CheckboxField({
  id,
  label,
  checked,
  onChange,
  icon,
}: CheckboxFieldProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <Label
        htmlFor={id}
        className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {icon && <icon className="w-4 h-4" />}
        {label}
      </Label>
    </div>
  );
}

interface ModelFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  availableModels?: string[];
  customPlaceholder?: string;
  selectPlaceholder?: string;
  icon?: LucideIcon;
  required?: boolean;
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
  return (
    <BaseField id={id} label={label} icon={icon} required={required}>
      {availableModels.length > 0 ? (
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
      ) : (
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={customPlaceholder}
        />
      )}
    </BaseField>
  );
}

interface NumberFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  icon?: LucideIcon;
  required?: boolean;
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
  return (
    <BaseField id={id} label={label} icon={icon} required={required}>
      <Input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
      />
    </BaseField>
  );
}
