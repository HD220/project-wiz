import { Badge } from "@/components/ui/badge";

interface ProjectUnreadBadgeProps {
  unreadCount: number;
}

export function ProjectUnreadBadge({ unreadCount }: ProjectUnreadBadgeProps) {
  if (unreadCount <= 0) return null;

  return (
    <Badge
      className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs flex items-center justify-center"
      variant="destructive"
    >
      {unreadCount > 9 ? "9+" : unreadCount}
    </Badge>
  );
}
