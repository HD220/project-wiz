import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface Model {
  id: number;
  name: string;
  modelId: string;
  size: string;
  status: string;
  lastUsed: string | null;
  description: string;
}

interface ModelConfigurationProps {
  models: Model[];
}

export default function ModelConfiguration({
  models,
}: ModelConfigurationProps) {
  const [modelId, setModelId] = useState("mistralai/Mistral-7B-v0.1");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [memoryLimit, setMemoryLimit] = useState(8);
  const [autoUpdate, setAutoUpdate] = useState(true);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Configuration</CardTitle>
        <CardDescription>
          Configure parameters for the active model
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="model-select">Active Model</Label>
          <Select
            value={modelId}
            onValueChange={(value) => {
              setModelId(value);
            }}
          >
            <SelectTrigger id="model-select">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {models
                .filter((model) => model.status === "downloaded")
                .map((model) => (
                  <SelectItem key={model.id} value={model.modelId}>
                    {model.name} ({model.modelId})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 pt-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="temperature">Temperature: {temperature}</Label>
            <span className="text-sm text-muted-foreground w-12 text-right">
              {temperature}
            </span>
          </div>
          <Slider
            id="temperature"
            min={0}
            max={1}
            step={0.1}
            value={[temperature]}
            onValueChange={(value) => setTemperature(value[0])}
          />
          <p className="text-xs text-muted-foreground">
            Controls randomness: Lower values are more deterministic, higher
            values more creative.
          </p>
        </div>

        <div className="space-y-2 pt-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="max-tokens">Max Tokens: {maxTokens}</Label>
            <span className="text-sm text-muted-foreground w-12 text-right">
              {maxTokens}
            </span>
          </div>
          <Slider
            id="max-tokens"
            min={256}
            max={4096}
            step={256}
            value={[maxTokens]}
            onValueChange={(value) => setMaxTokens(value[0])}
          />
          <p className="text-xs text-muted-foreground">
            Maximum number of tokens to generate in a single response.
          </p>
        </div>

        <div className="space-y-2 pt-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="memory-limit">
              Memory Limit (GB): {memoryLimit}
            </Label>
            <span className="text-sm text-muted-foreground w-12 text-right">
              {memoryLimit}GB
            </span>
          </div>
          <Slider
            id="memory-limit"
            min={4}
            max={16}
            step={1}
            value={[memoryLimit]}
            onValueChange={(value) => setMemoryLimit(value[0])}
          />
          <p className="text-xs text-muted-foreground">
            Maximum memory allocation for the model.
          </p>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="space-y-0.5">
            <Label htmlFor="auto-update">Automatically Update Models</Label>
            <p className="text-sm text-muted-foreground">
              Enable automatic updates for models.
            </p>
          </div>
          <Switch
            id="auto-update"
            checked={autoUpdate}
            onCheckedChange={setAutoUpdate}
          />
        </div>
      </CardContent>
    </Card>
  );
}
