import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";
import { useChart } from "./chart-context";

function LegendItem({
  item,
  index,
  hideIcon,
  nameKey,
  config,
}: {
  item: any;
  index: number;
  hideIcon: boolean;
  nameKey?: string;
  config: any;
}) {
  const key = `${nameKey || item.dataKey || "value"}`;
  const itemConfig = config[key as keyof typeof config];

  return (
    <div
      key={index}
      className={cn(
        "flex items-center gap-1.5 [&>svg]:size-3 [&>svg]:text-muted-foreground",
        item.inactive && "opacity-50",
      )}
    >
      {itemConfig?.icon && !hideIcon ? (
        <itemConfig.icon />
      ) : (
        <div
          className="size-2 rounded-full"
          style={{ backgroundColor: item.color }}
        />
      )}
      {itemConfig?.label}
    </div>
  );
}

export function ChartLegend(
  props: React.ComponentProps<typeof RechartsPrimitive.Legend> & {
    hideIcon?: boolean;
    nameKey?: string;
  },
) {
  const {
    className,
    hideIcon = false,
    payload,
    verticalAlign = "bottom",
    nameKey,
    ref, // Destructure ref to omit it from rest
    ...rest
  } = props;
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn("flex items-center justify-center gap-4", className)}
      {...rest}
    >
      {payload.map((item: any, index: number) => (
        <LegendItem
          key={index}
          item={item}
          index={index}
          hideIcon={hideIcon}
          nameKey={nameKey}
          config={config}
        />
      ))}
    </div>
  );
}

export function ChartLegendContent(
  props: React.ComponentProps<typeof RechartsPrimitive.Legend> & {
    hideIcon?: boolean;
    nameKey?: string;
  },
) {
  const {
    className,
    hideIcon = false,
    payload,
    verticalAlign = "bottom",
    nameKey,
    ref, // Destructure ref to omit it from rest
    ...rest
  } = props;
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn("flex items-center justify-center gap-4", className)}
      {...rest}
    >
      {payload.map((item: any, index: number) => (
        <LegendItem
          key={index}
          item={item}
          index={index}
          hideIcon={hideIcon}
          nameKey={nameKey}
          config={config}
        />
      ))}
    </div>
  );
}
