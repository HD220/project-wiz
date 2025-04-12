import { FC, ReactNode } from "react";
import { ConfigSlider } from "@/components/ui/config-slider";
import { Trans } from "@lingui/macro";
import { i18n } from "@lingui/core";

export interface TemperatureSliderProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
  i18n: typeof i18n;
}

export const TemperatureSlider: FC<TemperatureSliderProps> = ({
  value,
  onChange,
  error,
  i18n,
}) => (
  <ConfigSlider
    id="temperature"
    label={<Trans>Temperature</Trans>}
    value={value}
    min={0}
    max={1}
    step={0.1}
    onChange={onChange}
    description={
      <Trans>
        Controls randomness: Lower values are more deterministic, higher values more creative.
      </Trans>
    }
    error={error}
  />
);