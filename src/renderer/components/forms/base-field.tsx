import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

import { Label } from "@/components/ui/label";

interface BaseFieldProps {
  id: string;
  label: string;
  icon?: LucideIcon;
  required?: boolean;
  children: ReactNode;
}

export function BaseField({
  id,
  label,
  icon: Icon,
  required,
  children,
}: BaseFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
    </div>
  );
}
