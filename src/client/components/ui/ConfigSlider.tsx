import { ReactNode } from "react";
import { Label } from "./label";
import { Slider } from "./slider";

interface ConfigSliderProps {
  id: string;
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  description?: ReactNode;
  error?: string;
  unit?: string;
}

export function ConfigSlider({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
  description,
  error,
  unit,
}: ConfigSliderProps) {
  return (
    <div className="space-y-2 pt-4">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>
          {label}
        </Label>
        <span className="text-sm text-muted-foreground w-12 text-right">
          {value}
          {unit ? unit : null}
        </span>
      </div>
      <Slider
        id={id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default ConfigSlider;