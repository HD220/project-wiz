import { Card, CardContent } from "@/components/ui/card";

import { Task } from "@/renderer/lib/placeholders";
import { TaskCardHeader } from "./task-card-header";
import { TaskCardLabels } from "./task-card-labels";
import { TaskCardDueDate } from "./task-card-due-date";
import { TaskCardAssignee } from "./task-card-assignee";
import { getDaysUntilDue, getPriorityColor } from "./task-card-utils";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const daysUntilDue = getDaysUntilDue(task.dueDate);
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
  const isDueSoon =
    daysUntilDue !== null && daysUntilDue <= 2 && daysUntilDue >= 0;

  const handleTaskClick = () => {
    console.log("Opening task:", task.id);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow group"
      onClick={handleTaskClick}
    >
      <TaskCardHeader
        task={task}
        getPriorityColor={getPriorityColor}
        onTaskClick={handleTaskClick}
      />

      <CardContent className="pt-0 space-y-3">
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <TaskCardLabels labels={task.labels} />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            {task.dueDate && (
              <TaskCardDueDate
                dueDate={task.dueDate}
                daysUntilDue={daysUntilDue}
                isOverdue={isOverdue}
                isDueSoon={isDueSoon}
              />
            )}
          </div>

          {task.estimatedHours && (
            <div className="flex items-center gap-1">
              <span>{task.estimatedHours}h</span>
              {task.actualHours && (
                <span className="text-muted-foreground/60">
                  / {task.actualHours}h
                </span>
              )}
            </div>
          )}
        </div>

        <TaskCardAssignee
          assigneeId={task.assigneeId}
          assigneeName={task.assigneeName}
          assigneeAvatar={task.assigneeAvatar}
        />
      </CardContent>
    </Card>
  );
}
