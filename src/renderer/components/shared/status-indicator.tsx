import { createContext, useContext } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/renderer/lib/utils";
import { Badge } from "@/renderer/components/ui/badge";

// Status types for type safety
type StatusType =
  | "active"
  | "inactive"
  | "pending"
  | "error"
  | "success"
  | "warning"
  | "loading";

// Context for compound component communication
interface StatusIndicatorContextValue {
  status: StatusType;
  variant: "dot" | "badge" | "pill" | "minimal";
  animated: boolean;
  size: "sm" | "md" | "lg";
}

const StatusIndicatorContext =
  createContext<StatusIndicatorContextValue | null>(null);

function useStatusIndicatorContext() {
  const context = useContext(StatusIndicatorContext);
  if (!context) {
    throw new Error(
      "StatusIndicator components must be used within StatusIndicator.Root",
    );
  }
  return context;
}

// Root component variants
const statusRootVariants = cva("inline-flex items-center gap-1.5", {
  variants: {
    variant: {
      dot: "items-center",
      badge: "items-center",
      pill: "rounded-full px-2 py-1 bg-muted/50",
      minimal: "items-center gap-1",
    },
    size: {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: {
    variant: "dot",
    size: "md",
  },
});

// Status color mappings
const statusColors = {
  active: {
    dot: "bg-green-500",
    badge:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
    text: "text-green-700 dark:text-green-300",
  },
  inactive: {
    dot: "bg-gray-400",
    badge:
      "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300",
    text: "text-gray-600 dark:text-gray-400",
  },
  pending: {
    dot: "bg-yellow-500",
    badge:
      "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
    text: "text-yellow-700 dark:text-yellow-300",
  },
  error: {
    dot: "bg-red-500",
    badge:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
    text: "text-red-700 dark:text-red-300",
  },
  success: {
    dot: "bg-green-500",
    badge:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
    text: "text-green-700 dark:text-green-300",
  },
  warning: {
    dot: "bg-orange-500",
    badge:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300",
    text: "text-orange-700 dark:text-orange-300",
  },
  loading: {
    dot: "bg-blue-500",
    badge:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
    text: "text-blue-700 dark:text-blue-300",
  },
} as const;

// Root component
interface StatusIndicatorRootProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof statusRootVariants> {
  status: StatusType;
  animated?: boolean;
}

function StatusIndicatorRoot(props: StatusIndicatorRootProps) {
  const {
    status,
    variant = "dot",
    size = "md",
    animated = false,
    className,
    children,
    ...rest
  } = props;

  return (
    <StatusIndicatorContext.Provider
      value={{
        status,
        variant: variant || "dot",
        animated,
        size: size || "md",
      }}
    >
      <div
        data-slot="status-indicator"
        className={cn(statusRootVariants({ variant, size }), className)}
        {...rest}
      >
        {children}
      </div>
    </StatusIndicatorContext.Provider>
  );
}

// Dot component - the visual indicator
const dotVariants = cva("rounded-full shrink-0", {
  variants: {
    size: {
      sm: "h-1.5 w-1.5",
      md: "h-2 w-2",
      lg: "h-2.5 w-2.5",
    },
    animated: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    size: "md",
    animated: false,
  },
});

interface StatusIndicatorDotProps extends React.ComponentProps<"div"> {}

function StatusIndicatorDot(props: StatusIndicatorDotProps) {
  const { className, ...rest } = props;
  const { status, size, animated } = useStatusIndicatorContext();

  const colorClass = statusColors[status]?.dot || statusColors.inactive.dot;
  const animationClass =
    animated && (status === "loading" || status === "pending")
      ? "status-pulse"
      : "";

  return (
    <div
      data-slot="status-indicator-dot"
      className={cn(
        dotVariants({ size }),
        colorClass,
        animationClass,
        className,
      )}
      {...rest}
    />
  );
}

// Label component
interface StatusIndicatorLabelProps extends React.ComponentProps<"span"> {
  asChild?: boolean;
}

function StatusIndicatorLabel(props: StatusIndicatorLabelProps) {
  const { className, asChild = false, children, ...rest } = props;
  const { status, variant } = useStatusIndicatorContext();
  const Comp = asChild ? Slot : "span";

  const textColorClass =
    variant === "badge"
      ? "" // Badge handles its own colors
      : statusColors[status]?.text || statusColors.inactive.text;

  return (
    <Comp
      data-slot="status-indicator-label"
      className={cn("font-medium leading-none", textColorClass, className)}
      {...rest}
    >
      {children}
    </Comp>
  );
}

// Badge variant component
interface StatusIndicatorBadgeProps
  extends React.ComponentProps<typeof Badge> {}

function StatusIndicatorBadge(props: StatusIndicatorBadgeProps) {
  const { className, children, ...rest } = props;
  const { status } = useStatusIndicatorContext();

  const colorClass = statusColors[status]?.badge || statusColors.inactive.badge;

  return (
    <Badge
      data-slot="status-indicator-badge"
      variant="outline"
      className={cn(colorClass, className)}
      {...rest}
    >
      {children}
    </Badge>
  );
}

// Icon component for additional visual indicators
interface StatusIndicatorIconProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function StatusIndicatorIcon(props: StatusIndicatorIconProps) {
  const { className, asChild = false, children, ...rest } = props;
  const { status, size } = useStatusIndicatorContext();
  const Comp = asChild ? Slot : "div";

  const textColorClass =
    statusColors[status]?.text || statusColors.inactive.text;

  return (
    <Comp
      data-slot="status-indicator-icon"
      className={cn(
        "flex items-center justify-center shrink-0",
        {
          "h-3 w-3": size === "sm",
          "h-4 w-4": size === "md",
          "h-5 w-5": size === "lg",
        },
        textColorClass,
        className,
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
}

// Helper function to get status text
function getStatusText(status: StatusType): string {
  const statusTexts = {
    active: "Active",
    inactive: "Inactive",
    pending: "Pending",
    error: "Error",
    success: "Success",
    warning: "Warning",
    loading: "Loading",
  };

  return statusTexts[status] || "Unknown";
}

// Predefined status components for common cases
interface QuickStatusProps {
  className?: string;
  label?: string;
  showLabel?: boolean;
  animated?: boolean;
  size?: "sm" | "md" | "lg";
}

function ActiveStatus(props: QuickStatusProps) {
  const { label = getStatusText("active"), showLabel = true, ...rest } = props;

  return (
    <StatusIndicatorRoot status="active" {...rest}>
      <StatusIndicatorDot />
      {showLabel && <StatusIndicatorLabel>{label}</StatusIndicatorLabel>}
    </StatusIndicatorRoot>
  );
}

function InactiveStatus(props: QuickStatusProps) {
  const {
    label = getStatusText("inactive"),
    showLabel = true,
    ...rest
  } = props;

  return (
    <StatusIndicatorRoot status="inactive" {...rest}>
      <StatusIndicatorDot />
      {showLabel && <StatusIndicatorLabel>{label}</StatusIndicatorLabel>}
    </StatusIndicatorRoot>
  );
}

function LoadingStatus(props: QuickStatusProps) {
  const {
    label = getStatusText("loading"),
    showLabel = true,
    animated = true,
    ...rest
  } = props;

  return (
    <StatusIndicatorRoot status="loading" animated={animated} {...rest}>
      <StatusIndicatorDot />
      {showLabel && <StatusIndicatorLabel>{label}</StatusIndicatorLabel>}
    </StatusIndicatorRoot>
  );
}

function ErrorStatus(props: QuickStatusProps) {
  const { label = getStatusText("error"), showLabel = true, ...rest } = props;

  return (
    <StatusIndicatorRoot status="error" {...rest}>
      <StatusIndicatorDot />
      {showLabel && <StatusIndicatorLabel>{label}</StatusIndicatorLabel>}
    </StatusIndicatorRoot>
  );
}

// Export compound component
export const StatusIndicator = {
  Root: StatusIndicatorRoot,
  Dot: StatusIndicatorDot,
  Label: StatusIndicatorLabel,
  Badge: StatusIndicatorBadge,
  Icon: StatusIndicatorIcon,
  // Quick access components
  Active: ActiveStatus,
  Inactive: InactiveStatus,
  Loading: LoadingStatus,
  Error: ErrorStatus,
};

// Export types and utilities
export type {
  StatusType,
  StatusIndicatorRootProps,
  StatusIndicatorDotProps,
  StatusIndicatorLabelProps,
  StatusIndicatorBadgeProps,
  StatusIndicatorIconProps,
  QuickStatusProps,
};

export { getStatusText };
