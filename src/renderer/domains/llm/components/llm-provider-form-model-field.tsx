import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ModelFieldProps {
  value: string;
  availableModels: string[];
  onChange: (value: string) => void;
}

export function ModelField({
  value,
  availableModels,
  onChange,
}: ModelFieldProps) {
  return (
    <div className="space-y-2">
      <Label>Model</Label>
      {availableModels.length > 0 ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a model" />
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
          id="model"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter custom model name"
        />
      )}
    </div>
  );
}
