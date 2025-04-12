import { FC } from "react";
import { ConfigSlider } from "@/components/ui/config-slider";
import { Trans } from "@lingui/macro";
import { i18n } from "@lingui/core";

export interface MemoryLimitSliderProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
  i18n: typeof i18n;
}

export const MemoryLimitSlider: FC<MemoryLimitSliderProps> = ({
  value,
  onChange,
  error,
  i18n,
}) => (
  <ConfigSlider
    id="memory-limit"
    label={<Trans>Memory Limit (GB)</Trans>}
    value={value}
    min={4}
    max={16}
    step={1}
    onChange={onChange}
    description={
      <Trans>
        Maximum memory allocation for the model.
      </Trans>
    }
    error={error}
    unit="GB"
  />
);