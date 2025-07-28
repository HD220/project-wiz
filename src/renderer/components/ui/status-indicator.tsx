import { Badge } from "@/renderer/components/ui/badge";
import { cn } from "@/renderer/lib/utils";

type StatusType = "active" | "inactive" | "busy" | "error";
type StatusSize = "sm" | "md" | "lg";
type StatusVariant = "dot" | "badge" | "text";

interface StatusIndicatorProps {
  status: StatusType;
  size?: StatusSize;
  variant?: StatusVariant;
  className?: string;
  "aria-label"?: string;
}

export function StatusIndicator({
  status,
  size = "md",
  variant = "dot",
  className,
  "aria-label": ariaLabel,
}: StatusIndicatorProps) {
  // Inline status color mapping - unified colors across app
  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case "active":
        return "bg-chart-2";
      case "inactive":
        return "bg-muted-foreground";
      case "busy":
        return "bg-destructive animate-pulse";
      case "error":
        return "bg-destructive";
      default:
        return "bg-muted-foreground";
    }
  };

  // Inline dot size mapping - precise sizes as specified
  const getDotSize = (size: StatusSize) => {
    switch (size) {
      case "sm":
        return "w-1.5 h-1.5"; // 6px
      case "md":
        return "w-2 h-2"; // 8px
      case "lg":
        return "w-2.5 h-2.5"; // 10px
      default:
        return "w-2 h-2";
    }
  };

  // Inline text size mapping for badge variant
  const getTextSize = (size: StatusSize) => {
    switch (size) {
      case "sm":
        return "text-xs px-1.5 py-0.5";
      case "md":
        return "text-xs px-2 py-1";
      case "lg":
        return "text-sm px-2.5 py-1";
      default:
        return "text-xs px-2 py-1";
    }
  };

  // Inline status label mapping
  const getStatusLabel = (status: StatusType) => {
    switch (status) {
      case "active":
        return "Active";
      case "inactive":
        return "Inactive";
      case "busy":
        return "Busy";
      case "error":
        return "Error";
      default:
        return "Unknown";
    }
  };

  // Inline badge variant mapping
  const getBadgeVariant = (status: StatusType) => {
    switch (status) {
      case "active":
        return "default";
      case "busy":
      case "error":
        return "destructive";
      case "inactive":
      default:
        return "secondary";
    }
  };

  const statusColor = getStatusColor(status);
  const dotSize = getDotSize(size);
  const textSize = getTextSize(size);
  const statusLabel = getStatusLabel(status);
  const badgeVariant = getBadgeVariant(status);

  // Generate accessible label if not provided
  const accessibleLabel = ariaLabel || `Status: ${statusLabel}`;

  // Dot variant - simple colored dot
  if (variant === "dot") {
    return (
      <div
        className={cn(
          "rounded-full shrink-0 transition-colors",
          statusColor,
          dotSize,
          className,
        )}
        role="status"
        aria-label={accessibleLabel}
      />
    );
  }

  // Text variant - text only, no dot
  if (variant === "text") {
    return (
      <span
        className={cn(
          "font-medium transition-colors",
          status === "active" && "text-chart-2",
          status === "inactive" && "text-muted-foreground",
          (status === "busy" || status === "error") && "text-destructive",
          textSize.split(" ")[0], // Extract only text size
          className,
        )}
        role="status"
        aria-label={accessibleLabel}
      >
        {statusLabel}
      </span>
    );
  }

  // Badge variant - dot + text in badge
  return (
    <Badge
      variant={badgeVariant}
      className={cn(
        "inline-flex items-center gap-1.5 font-medium transition-colors",
        textSize,
        className,
      )}
      role="status"
      aria-label={accessibleLabel}
    >
      <div
        className={cn("rounded-full shrink-0", statusColor, dotSize)}
        aria-hidden="true"
      />
      {statusLabel}
    </Badge>
  );
}

// Export types for component consumers
export type { StatusType, StatusSize, StatusVariant };
