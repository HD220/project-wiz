import { FC } from "react";
import { ModelSelect } from "@/components/ui/model-select";
import { Trans } from "@lingui/macro";
import { i18n } from "@lingui/core";

/**
 * Props for ModelIdSelector component.
 * @property models - List of available models.
 * @property value - Currently selected modelId.
 * @property onChange - Callback to set the selected modelId.
 * @property error - Optional error message (already translated).
 * @property i18n - Lingui i18n instance for translations.
 */
export interface ModelIdSelectorProps {
  models: { modelId: string; name?: string; status: string }[];
  value: string;
  onChange: (id: string) => void;
  error?: string;
  i18n: typeof i18n;
}

export const ModelIdSelector: FC<ModelIdSelectorProps> = ({
  models,
  value,
  onChange,
  error,
  i18n,
}) => {
  // Map models to ModelOption type expected by ModelSelect
  const options = models.map((m) => ({
    id: m.modelId,
    modelId: m.modelId,
    name: m.name ?? m.modelId,
    status: m.status,
  }));

  return (
    <ModelSelect
      id="model-select"
      label={<Trans>Active Model</Trans>}
      models={options}
      value={value}
      onChange={onChange}
      error={error}
      placeholder={i18n._("Select a model")}
    />
  );
};