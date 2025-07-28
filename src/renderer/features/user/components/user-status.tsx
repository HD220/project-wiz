import { cn } from "@/renderer/lib/utils";

type UserStatusType = "online" | "away" | "busy" | "offline";

interface UserStatusConfig {
  indicator: string;
  ring: string;
  text: string;
  label: string;
}

interface UserStatusProps {
  status?: UserStatusType;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function UserStatus(props: UserStatusProps) {
  const { status = "online", className, showLabel = true, size = "md" } = props;

  const statusConfig: Record<UserStatusType, UserStatusConfig> = {
    online: {
      indicator: "bg-gradient-to-r from-emerald-400 to-emerald-500",
      ring: "ring-emerald-400/30",
      text: "text-emerald-600 dark:text-emerald-400",
      label: "Online",
    },
    away: {
      indicator: "bg-gradient-to-r from-amber-400 to-amber-500",
      ring: "ring-amber-400/30",
      text: "text-amber-600 dark:text-amber-400",
      label: "Away",
    },
    busy: {
      indicator: "bg-gradient-to-r from-red-400 to-red-500",
      ring: "ring-red-400/30",
      text: "text-red-600 dark:text-red-400",
      label: "Busy",
    },
    offline: {
      indicator: "bg-gradient-to-r from-slate-400 to-slate-500",
      ring: "ring-slate-400/30",
      text: "text-muted-foreground",
      label: "Offline",
    },
  };

  const config = statusConfig[status];
  const sizeClasses = {
    sm: "size-1.5",
    md: "size-2",
  };
  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
  };
  const spacingClasses = {
    sm: "gap-1.5",
    md: "gap-2",
  };

  return (
    <div
      className={cn(
        "flex items-center transition-all duration-200",
        spacingClasses[size],
        className,
      )}
      role="status"
      aria-label={`User status: ${config.label}`}
    >
      <div
        className={cn(
          "rounded-full ring-2 transition-all duration-200",
          "hover:scale-[1.01] hover:ring-4",
          sizeClasses[size],
          config.indicator,
          config.ring,
        )}
        aria-hidden="true"
      />
      {showLabel && (
        <span
          className={cn(
            "font-medium transition-colors duration-200",
            textSizeClasses[size],
            config.text,
          )}
        >
          {config.label}
        </span>
      )}
    </div>
  );
}

export type { UserStatusType, UserStatusConfig };
