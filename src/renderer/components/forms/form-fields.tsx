import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { BaseField } from "./base-field";

import type { LucideIcon } from "lucide-react";

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: LucideIcon;
  required?: boolean;
  type?: "text" | "email" | "url" | "number";
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
}: TextFieldProps) {
  return (
    <BaseField id={id} label={label} icon={icon} required={required}>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
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
