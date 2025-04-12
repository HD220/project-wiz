import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/macro";
import { ModelSelect } from "@/components/ui/model-select";
import { ConfigSlider } from "@/components/ui/config-slider";
import { AutoUpdateSwitch } from "@/components/ui/auto-update-switch";
import { useModelConfiguration } from "@/hooks/use-model-configuration";

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

export default function ModelConfiguration({ models }: ModelConfigurationProps) {
  const { i18n } = useLingui();

  const {
    modelId,
    temperature,
    maxTokens,
    memoryLimit,
    autoUpdate,
    errors,
    setModelId,
    setTemperature,
    setMaxTokens,
    setMemoryLimit,
    setAutoUpdate,
  } = useModelConfiguration({
    initialModelId: models.find((m) => m.status === "downloaded")?.modelId || "",
    availableModels: models,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Trans>Model Configuration</Trans>
        </CardTitle>
        <CardDescription>
          <Trans>Configure parameters for the active model</Trans>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ModelSelect
          id="model-select"
          label={<Trans>Active Model</Trans>}
          models={models}
          value={modelId}
          onChange={setModelId}
          error={errors.modelId ? i18n._(errors.modelId) : undefined}
          placeholder={i18n._("Select a model")}
        />

        <ConfigSlider
          id="temperature"
          label={<Trans>Temperature</Trans>}
          value={temperature}
          min={0}
          max={1}
          step={0.1}
          onChange={setTemperature}
          description={
            <Trans>
              Controls randomness: Lower values are more deterministic, higher values more creative.
            </Trans>
          }
          error={errors.temperature ? i18n._(errors.temperature) : undefined}
        />

        <ConfigSlider
          id="max-tokens"
          label={<Trans>Max Tokens</Trans>}
          value={maxTokens}
          min={256}
          max={4096}
          step={256}
          onChange={setMaxTokens}
          description={
            <Trans>
              Maximum number of tokens to generate in a single response.
            </Trans>
          }
          error={errors.maxTokens ? i18n._(errors.maxTokens) : undefined}
        />

        <ConfigSlider
          id="memory-limit"
          label={<Trans>Memory Limit (GB)</Trans>}
          value={memoryLimit}
          min={4}
          max={16}
          step={1}
          onChange={setMemoryLimit}
          description={
            <Trans>
              Maximum memory allocation for the model.
            </Trans>
          }
          error={errors.memoryLimit ? i18n._(errors.memoryLimit) : undefined}
          unit="GB"
        />

        <AutoUpdateSwitch
          id="auto-update"
          label={<Trans>Automatically Update Models</Trans>}
          description={
            <Trans>
              Enable automatic updates for models.
            </Trans>
          }
          checked={autoUpdate}
          onChange={setAutoUpdate}
        />
      </CardContent>
    </Card>
  );
}
