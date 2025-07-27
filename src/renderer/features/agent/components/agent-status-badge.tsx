import { cva, type VariantProps } from "class-variance-authority";
import type { AgentStatus } from "@/renderer/features/agent/agent.types";
import { cn } from "@/renderer/lib/utils";

// Status indicator variants using design tokens
const statusIndicatorVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      status: {
        active:
          "bg-emerald-50 text-emerald-700 border-emerald-200/50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
        inactive:
          "bg-slate-50 text-slate-600 border-slate-200/50 hover:bg-slate-100 dark:bg-slate-950/50 dark:text-slate-400 dark:border-slate-800",
        busy: "bg-orange-50 text-orange-700 border-orange-200/50 hover:bg-orange-100 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800",
      },
      size: {
        sm: "px-1.5 py-0.5 text-xs",
        md: "px-2 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
      withDot: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      withDot: true,
    },
  },
);

// Status dot variants
const statusDotVariants = cva("rounded-full shrink-0", {
  variants: {
    status: {
      active: "bg-emerald-500 dark:bg-emerald-400",
      inactive: "bg-slate-400 dark:bg-slate-500",
      busy: "bg-orange-500 dark:bg-orange-400",
    },
    size: {
      sm: "size-1.5",
      md: "size-2",
      lg: "size-2.5",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

// Main compound component
interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusIndicatorVariants> {
  status: AgentStatus;
  children?: React.ReactNode;
}

function StatusIndicator({
  status,
  size,
  withDot,
  className,
  children,
  ...props
}: StatusIndicatorProps) {
  return (
    <div
      data-slot="status-indicator"
      className={cn(
        statusIndicatorVariants({ status, size, withDot }),
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Status dot sub-component
interface StatusDotProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusDotVariants> {
  status: AgentStatus;
}

function StatusDot({ status, size, className, ...props }: StatusDotProps) {
  return (
    <div
      data-slot="status-dot"
      className={cn(statusDotVariants({ status, size }), className)}
      aria-hidden="true"
      {...props}
    />
  );
}

// Status label sub-component
interface StatusLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: AgentStatus;
}

function StatusLabel({
  status,
  className,
  children,
  ...props
}: StatusLabelProps) {
  // Status label mapping with proper capitalization
  const statusLabels: Record<AgentStatus, string> = {
    active: "Active",
    inactive: "Inactive",
    busy: "Busy",
  };

  return (
    <span
      data-slot="status-label"
      className={cn("font-medium", className)}
      {...props}
    >
      {children || statusLabels[status]}
    </span>
  );
}

// Legacy AgentStatusBadge component for backward compatibility
interface AgentStatusBadgeProps {
  status: AgentStatus;
  className?: string;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
}

function AgentStatusBadge({
  status,
  className,
  size = "md",
  showDot = true,
}: AgentStatusBadgeProps) {
  return (
    <StatusIndicator
      status={status}
      size={size}
      withDot={showDot}
      className={cn("border", className)}
    >
      {showDot && <StatusDot status={status} size={size} />}
      <StatusLabel status={status} />
    </StatusIndicator>
  );
}

export {
  StatusIndicator,
  StatusDot,
  StatusLabel,
  AgentStatusBadge,
  statusIndicatorVariants,
  statusDotVariants,
};
