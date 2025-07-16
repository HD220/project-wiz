import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";
import { useChart } from "./chart-context";

export function ChartTooltip({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> & {
  indicator?: "line" | "dot" | "dashed";
  hideLabel?: boolean;
  hideIndicator?: boolean;
  nameKey?: string;
  labelKey?: string;
}) {
  const { config } = useChart();

  if (!active || !payload?.length) {
    return null;
  }

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload.length) {
      return null;
    }

    const [item] = payload;
    const key = `${labelKey || item.dataKey || item.name || "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      !labelKey && typeof label === "string"
        ? config[label as keyof typeof config]?.label || label
        : itemConfig?.label;

    if (labelFormatter && typeof value !== "undefined") {
      return labelFormatter(value, payload);
    }

    return value;
  }, [label, labelFormatter, payload, hideLabel, labelKey, config]);

  return null;
}

export function ChartTooltipContent(
  props: React.ComponentProps<typeof RechartsPrimitive.Tooltip> & {
    indicator?: "line" | "dot" | "dashed";
    hideLabel?: boolean;
    hideIndicator?: boolean;
    nameKey?: string;
    labelKey?: string;
  },
) {
  const {
    active,
    payload,
    className,
    indicator = "dot",
    hideLabel = false,
    hideIndicator = false,
    label,
    labelFormatter,
    labelClassName,
    formatter,
    color,
    nameKey,
    labelKey,
  } = props;
  const { config } = useChart();

  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className={cn("rounded-lg border bg-background p-2", className)}>
      <div className="space-y-1">
        {payload.map((item: any, index: number) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor =
            color || item.payload?.[color || ""] || itemConfig?.color;

          return (
            <div key={index} className="flex items-center gap-2">
              {!hideIndicator && (
                <div
                  className={cn("size-2 rounded-full", {
                    "bg-current": true,
                  })}
                  style={{ backgroundColor: indicatorColor }}
                />
              )}
              <div className="flex-1 text-sm">
                {itemConfig?.label || item.name}
              </div>
              <div className="text-sm font-medium">
                {formatter
                  ? formatter(item.value, item.name, item, index, payload)
                  : item.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getPayloadConfigFromPayload(
  config: Record<string, any>,
  payload: any,
  key: string,
) {
  return config[key as keyof typeof config];
}
