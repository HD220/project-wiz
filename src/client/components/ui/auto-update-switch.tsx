import { ReactNode } from "react";
import { Label } from "./label";
import { Switch } from "./switch";

interface AutoUpdateSwitchProps {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  checked: boolean;
  onChange: (value: boolean) => void;
  error?: string;
}

export function AutoUpdateSwitch({
  id,
  label,
  description,
  checked,
  onChange,
  error,
}: AutoUpdateSwitchProps) {
  return (
    <div className="flex items-center justify-between pt-4">
      <div className="space-y-0.5">
        <Label htmlFor={id}>{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {error && (
          <p id={`${id}-error`} className="text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
    </div>
  );
}