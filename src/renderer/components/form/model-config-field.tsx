import { useController } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/renderer/components/ui/form";
import { Input } from "@/renderer/components/ui/input";
import { Slider } from "@/renderer/components/ui/slider";

interface ModelConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
}

interface ModelConfigFieldProps {
  name: string;
  label?: string;
  description?: string;
  control: any;
  defaultValue?: ModelConfig;
}

function ModelConfigField({
  name,
  label = "Model Configuration",
  description = "Configure the model parameters for this agent",
  control,
  defaultValue = {
    model: "gpt-4o",
    temperature: 0.7,
    maxTokens: 4000,
    topP: 1.0,
  },
}: ModelConfigFieldProps) {
  const { field } = useController({
    name,
    control,
    defaultValue: JSON.stringify(defaultValue, null, 2),
  });

  const parseConfig = (): ModelConfig => {
    try {
      return JSON.parse(field.value);
    } catch {
      return defaultValue;
    }
  };

  const updateConfig = (updates: Partial<ModelConfig>) => {
    const current = parseConfig();
    const updated = { ...current, ...updates };
    field.onChange(JSON.stringify(updated, null, 2));
  };

  const config = parseConfig();

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="space-y-6 p-4 border rounded-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium">Model</label>
            <Input
              value={config.model}
              onChange={(e) => updateConfig({ model: e.target.value })}
              placeholder="e.g., gpt-4o"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Temperature</label>
              <span className="text-sm text-muted-foreground">
                {config.temperature}
              </span>
            </div>
            <Slider
              value={[config.temperature]}
              onValueChange={([value]) => updateConfig({ temperature: value })}
              max={2}
              min={0}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Max Tokens</label>
            <Input
              type="number"
              value={config.maxTokens}
              onChange={(e) =>
                updateConfig({ maxTokens: parseInt(e.target.value) })
              }
              min={1}
              max={32000}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Top P</label>
              <span className="text-sm text-muted-foreground">
                {config.topP}
              </span>
            </div>
            <Slider
              value={[config.topP]}
              onValueChange={([value]) => updateConfig({ topP: value })}
              max={1}
              min={0}
              step={0.05}
              className="w-full"
            />
          </div>
        </div>
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
}

export { ModelConfigField };
