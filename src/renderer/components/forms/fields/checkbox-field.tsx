import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { LucideIcon } from "lucide-react";

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
