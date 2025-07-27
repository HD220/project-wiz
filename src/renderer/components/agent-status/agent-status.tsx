import { Badge } from "@/renderer/components/ui/badge";
import { cn } from "@/renderer/lib/utils";
import type { AgentStatus } from "@/renderer/features/agent/agent.types";

interface AgentStatusProps {
  status: AgentStatus;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
  className?: string;
}

export function AgentStatus({
  status,
  size = "md",
  showDot = true,
  className,
}: AgentStatusProps) {
  // Inline status variant mapping
  const getVariant = (status: AgentStatus) => {
    switch (status) {
      case "active":
        return "default";
      case "busy":
        return "destructive";
      case "inactive":
      default:
        return "secondary";
    }
  };

  // Inline size class mapping
  const getSizeClasses = (size: "sm" | "md" | "lg") => {
    switch (size) {
      case "sm":
        return "px-1.5 py-0.5 text-xs";
      case "lg":
        return "px-3 py-1.5 text-sm";
      case "md":
      default:
        return "px-2 py-1 text-xs";
    }
  };

  // Inline dot color mapping
  const getDotColor = (status: AgentStatus) => {
    switch (status) {
      case "active":
        return "bg-emerald-500 dark:bg-emerald-400";
      case "busy":
        return "bg-orange-500 dark:bg-orange-400";
      case "inactive":
      default:
        return "bg-slate-400 dark:bg-slate-500";
    }
  };

  // Inline dot size mapping
  const getDotSize = (size: "sm" | "md" | "lg") => {
    switch (size) {
      case "sm":
        return "size-1.5";
      case "lg":
        return "size-2.5";
      case "md":
      default:
        return "size-2";
    }
  };

  // Inline status label mapping
  const getStatusLabel = (status: AgentStatus) => {
    switch (status) {
      case "active":
        return "Active";
      case "busy":
        return "Busy";
      case "inactive":
      default:
        return "Inactive";
    }
  };

  const variant = getVariant(status);
  const sizeClasses = getSizeClasses(size);
  const dotColor = getDotColor(status);
  const dotSize = getDotSize(size);
  const statusLabel = getStatusLabel(status);

  return (
    <Badge
      variant={variant}
      className={cn(
        "inline-flex items-center gap-1.5 font-medium transition-colors",
        sizeClasses,
        className,
      )}
    >
      {showDot && (
        <div
          className={cn("rounded-full shrink-0", dotColor, dotSize)}
          aria-hidden="true"
        />
      )}
      {statusLabel}
    </Badge>
  );
}
