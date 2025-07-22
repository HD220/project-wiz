import { cn } from "@/renderer/lib/utils";

type UserStatusType = "online" | "away" | "busy" | "offline";

interface UserStatusConfig {
  color: string;
  label: string;
}

interface UserStatusProps {
  status?: UserStatusType;
  className?: string;
}

function UserStatus(props: UserStatusProps) {
  const { status = "online", className } = props;

  const statusConfig: Record<UserStatusType, UserStatusConfig> = {
    online: { color: "bg-green-500", label: "Online" },
    away: { color: "bg-yellow-500", label: "Away" },
    busy: { color: "bg-red-500", label: "Busy" },
    offline: { color: "bg-gray-500", label: "Offline" },
  };

  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className={cn("w-2 h-2 rounded-full", config.color)} />
      <span className="text-xs text-muted-foreground">{config.label}</span>
    </div>
  );
}

export { UserStatus };
export type { UserStatusType, UserStatusConfig };
