import { Badge } from "@/renderer/components/ui/badge";
import { cn } from "@/renderer/lib/utils";

import {
  getUserStatusVariant,
  getUserStatusSizeClasses,
  getUserStatusDotColor,
  getUserStatusDotSize,
  getUserStatusLabel,
  type UserStatus,
} from "@/shared/utils/user-status.utils";

interface UserStatusProps {
  status: UserStatus;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
  className?: string;
}

export function UserStatusBadge({
  status,
  size = "md",
  showDot = true,
  className,
}: UserStatusProps) {
  const variant = getUserStatusVariant(status);
  const sizeClasses = getUserStatusSizeClasses(size);
  const dotColor = getUserStatusDotColor(status);
  const dotSize = getUserStatusDotSize(size);
  const statusLabel = getUserStatusLabel(status);

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
