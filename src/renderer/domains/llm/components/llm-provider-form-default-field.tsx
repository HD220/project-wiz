import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface DefaultFieldProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export function DefaultField({ value, onChange }: DefaultFieldProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="isDefault"
        checked={value}
        onCheckedChange={(checked) => onChange(checked as boolean)}
      />
      <Label htmlFor="isDefault" className="text-sm font-normal">
        Definir como provedor padrão
      </Label>
    </div>
  );
}
