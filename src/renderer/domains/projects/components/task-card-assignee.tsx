import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TaskCardAssigneeProps {
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
}

export function TaskCardAssignee({
  assigneeId,
  assigneeName,
  assigneeAvatar,
}: TaskCardAssigneeProps) {
  if (!assigneeId) return null;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Avatar className="w-6 h-6">
          <AvatarImage src={assigneeAvatar} />
          <AvatarFallback className="text-xs">
            {assigneeAvatar || assigneeName?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-xs text-muted-foreground truncate">
          {assigneeName}
        </span>
      </div>
    </div>
  );
}
