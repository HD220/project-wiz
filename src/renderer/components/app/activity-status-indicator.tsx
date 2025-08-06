import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/renderer/lib/utils";

type ActivityStatusType = "success" | "info" | "warning" | "error";

interface StatusConfig {
  indicator: string;
  ring: string;
  text: string;
  background: string;
  label: string;
}

const activityStatusConfigs: Record<ActivityStatusType, StatusConfig> = {
  success: {
    indicator: "bg-gradient-to-r from-green-400 to-green-500",
    ring: "ring-green-400/30",
    text: "text-green-600 dark:text-green-400",
    background: "bg-green-500/10",
    label: "Success",
  },
  info: {
    indicator: "bg-gradient-to-r from-blue-400 to-blue-500",
    ring: "ring-blue-400/30",
    text: "text-primary",
    background: "bg-primary/10",
    label: "Info",
  },
  warning: {
    indicator: "bg-gradient-to-r from-yellow-400 to-yellow-500",
    ring: "ring-yellow-400/30",
    text: "text-yellow-600 dark:text-yellow-400",
    background: "bg-yellow-500/10",
    label: "Warning",
  },
  error: {
    indicator: "bg-gradient-to-r from-red-500 to-red-600",
    ring: "ring-red-500/30",
    text: "text-red-600 dark:text-red-400",
    background: "bg-red-500/10",
    label: "Error",
  },
};

const activityStatusIndicatorVariants = cva(
  "rounded-full transition-all duration-200",
  {
    variants: {
      size: {
        xs: "size-1",
        sm: "size-1.5",
        md: "size-2",
        lg: "size-2.5",
        xl: "size-3",
      },
      style: {
        dot: "ring-2",
        badge: "ring-2 hover:scale-[1.01] hover:ring-4",
        solid: "",
      },
    },
    defaultVariants: {
      size: "md",
      style: "badge",
    },
  },
);

interface ActivityStatusIndicatorProps
  extends VariantProps<typeof activityStatusIndicatorVariants> {
  status: ActivityStatusType;
  className?: string;
  showRing?: boolean;
}

const ActivityStatusIndicator = forwardRef<HTMLDivElement, ActivityStatusIndicatorProps>(
  (props, ref) => {
    const {
      status,
      size = "md",
      style = "badge",
      className,
      showRing = true,
      ...restProps
    } = props;

    const config = activityStatusConfigs[status];

    return (
      <div
        ref={ref}
        className={cn(
          activityStatusIndicatorVariants({ size, style }),
          config.indicator,
          showRing && config.ring,
          className,
        )}
        role="status"
        aria-label={`Status: ${config.label}`}
        {...restProps}
      />
    );
  },
);

ActivityStatusIndicator.displayName = "ActivityStatusIndicator";

export { ActivityStatusIndicator, activityStatusConfigs };
export type { ActivityStatusType };
