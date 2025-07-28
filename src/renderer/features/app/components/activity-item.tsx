import { ReactNode } from "react";

import { cn } from "@/renderer/lib/utils";

interface ActivityItemProps {
  icon: ReactNode;
  title: string;
  timestamp: string;
  variant?: "success" | "info" | "warning";
  className?: string;
  description?: string;
}

export function ActivityItem(props: ActivityItemProps) {
  const {
    icon,
    title,
    timestamp,
    variant = "info",
    className,
    description,
  } = props;

  const variantStyles = {
    success: {
      bg: "bg-green-500/10",
      text: "text-green-600 dark:text-green-400",
      indicator: "bg-green-500",
    },
    info: {
      bg: "bg-primary/10",
      text: "text-primary",
      indicator: "bg-primary",
    },
    warning: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-600 dark:text-yellow-400",
      indicator: "bg-yellow-500",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "group flex items-start gap-[var(--spacing-component-md)] p-[var(--spacing-component-md)] rounded-lg transition-all duration-200 ease-in-out",
        "hover:bg-muted/40 hover:shadow-sm hover:scale-[1.01]",
        "border border-transparent hover:border-border/30",
        styles.bg,
        className,
      )}
    >
      {/* Icon container with enhanced styling */}
      <div className="flex-shrink-0 flex items-center justify-center relative">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-[1.01]",
            styles.bg,
            "border border-border/20",
          )}
        >
          <div className={cn("w-4 h-4", styles.text)}>{icon}</div>
        </div>
        {/* Status indicator dot */}
        <div
          className={cn(
            "absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
            styles.indicator,
          )}
        />
      </div>

      {/* Content area with enhanced typography */}
      <div className="flex-1 min-w-0 space-y-[var(--spacing-component-xs)]">
        <div className="flex items-start justify-between gap-[var(--spacing-component-sm)]">
          <h4
            className={cn(
              "truncate transition-colors duration-200",
              styles.text,
            )}
            style={{
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-semibold)",
              lineHeight: "var(--line-height-tight)",
            }}
          >
            {title}
          </h4>
          <time
            className="flex-shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-foreground"
            style={{
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-medium)",
              lineHeight: "var(--line-height-normal)",
            }}
          >
            {timestamp}
          </time>
        </div>

        {/* Optional description */}
        {description && (
          <p
            className="text-muted-foreground transition-colors duration-200 group-hover:text-foreground/80"
            style={{
              fontSize: "var(--font-size-xs)",
              lineHeight: "var(--line-height-normal)",
            }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
