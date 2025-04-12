import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/macro";
import { AutoUpdateSwitch } from "@/components/ui/auto-update-switch";
import { ModelIdSelector } from "@/components/model-configuration/ModelIdSelector";
import { TemperatureSlider } from "@/components/model-configuration/TemperatureSlider";
import { MaxTokensSlider } from "@/components/model-configuration/MaxTokensSlider";
import { MemoryLimitSlider } from "@/components/model-configuration/MemoryLimitSlider";
import {
  useModelId,
  useTemperature,
  useMaxTokens,
  useMemoryLimit,
  useAutoUpdate,
  AvailableModel,
} from "@/hooks/use-model-configuration";
import { mapModelsToAvailableModels, Model } from "@/hooks/use-model-mapping";

interface ModelConfigurationProps {
  models: Model[];
}

export default function ModelConfiguration({ models }: ModelConfigurationProps) {
  const { i18n } = useLingui();

  const availableModels: AvailableModel[] = mapModelsToAvailableModels(models);

  const {
    modelId,
    setModelId,
    errorKey: modelIdErrorKey,
  } = useModelId({
    initialModelId: models.find((m) => m.status === "downloaded")?.modelId || "",
    availableModels,
  });

  const {
    temperature,
    setTemperature,
    errorKey: temperatureErrorKey,
  } = useTemperature();

  const {
    maxTokens,
    setMaxTokens,
    errorKey: maxTokensErrorKey,
  } = useMaxTokens();

  const {
    memoryLimit,
    setMemoryLimit,
    errorKey: memoryLimitErrorKey,
  } = useMemoryLimit();

  const { autoUpdate, setAutoUpdate } = useAutoUpdate();

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
        <ModelIdSelector
          models={models}
          value={modelId}
          onChange={setModelId}
          error={modelIdErrorKey ? i18n._(modelIdErrorKey) : undefined}
          i18n={i18n}
        />

        <TemperatureSlider
          value={temperature}
          onChange={setTemperature}
          error={temperatureErrorKey ? i18n._(temperatureErrorKey) : undefined}
          i18n={i18n}
        />

        <MaxTokensSlider
          value={maxTokens}
          onChange={setMaxTokens}
          error={maxTokensErrorKey ? i18n._(maxTokensErrorKey) : undefined}
          i18n={i18n}
        />

        <MemoryLimitSlider
          value={memoryLimit}
          onChange={setMemoryLimit}
          error={memoryLimitErrorKey ? i18n._(memoryLimitErrorKey) : undefined}
          i18n={i18n}
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
