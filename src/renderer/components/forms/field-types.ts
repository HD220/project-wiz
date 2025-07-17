import type { LucideIcon } from "lucide-react";

export interface BaseFieldProps {
  id: string;
  label: string;
  icon?: LucideIcon;
  required?: boolean;
}

export interface InputFieldProps extends BaseFieldProps {
  placeholder?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}
