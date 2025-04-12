import { FC } from "react";
import { ConfigSlider } from "@/components/ui/config-slider";
import { Trans } from "@lingui/macro";
import { i18n } from "@lingui/core";

/**
 * Props for MaxTokensSlider component.
 * @property value - Current max tokens value.
 * @property onChange - Callback to set the max tokens.
 * @property error - Optional error message (already translated).
 * @property i18n - Lingui i18n instance for translations.
 */
export interface MaxTokensSliderProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
  i18n: typeof i18n;
}

export const MaxTokensSlider: FC<MaxTokensSliderProps> = ({
  value,
  onChange,
  error,
  i18n,
}) => (
  <ConfigSlider
    id="max-tokens"
    label={<Trans>Max Tokens</Trans>}
    value={value}
    min={256}
    max={4096}
    step={256}
    onChange={onChange}
    description={
      <Trans>
        Maximum number of tokens to generate in a single response.
      </Trans>
    }
    error={error}
  />
);