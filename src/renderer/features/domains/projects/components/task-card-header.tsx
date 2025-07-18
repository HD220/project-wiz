import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle } from "@/components/ui/card/card-core";

import type { Task } from "@/lib/mock-data/types";

interface TaskCardHeaderProps {
  task: Task;
  onTaskClick: () => void;
}

export function TaskCardHeader({ task, onTaskClick }: TaskCardHeaderProps) {
  const getPriorityVariant = (priority: Task["priority"]) => {
    switch (priority) {
      case "High":
        return "destructive";
      case "Urgent":
        return "outline";
      case "Medium":
        return "secondary";
      case "Low":
      default:
        return "default";
    }
  };

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
          variant={getPriorityVariant(task.priority)}
          className="text-xs shrink-0"
        >
          {task.priority}
        </Badge>
      </div>
    </CardHeader>
  );
}
