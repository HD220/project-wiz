import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface AutomationSwitchProps {
  /** Unique id for the switch input */
  id: string;
  /** Main label for the automation switch */
  label: string;
  /** Description shown below the label */
  description: string;
  /** Current checked state */
  checked: boolean;
  /** Callback when the switch state changes */
  onCheckedChange: (value: boolean) => void;
}

/**
 * AutomationSwitch renders a labeled switch with description for automation settings.
 */
export function AutomationSwitch({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: AutomationSwitchProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label htmlFor={id}>{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}