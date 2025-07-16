import { Task } from "@/renderer/lib/placeholders";

import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle } from "@/components/ui/card";

interface TaskCardHeaderProps {
  task: Task;
  getPriorityColor: (priority: Task["priority"]) => string;
  onTaskClick: () => void;
}

export function TaskCardHeader({
  task,
  getPriorityColor,
  onTaskClick,
}: TaskCardHeaderProps) {
  return (
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={onTaskClick}
          className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
        >
          <CardTitle className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
            {task.title}
          </CardTitle>
        </button>
        <Badge
          variant={getPriorityColor(task.priority)}
          className="text-xs shrink-0"
        >
          {task.priority}
        </Badge>
      </div>
    </CardHeader>
  );
}
