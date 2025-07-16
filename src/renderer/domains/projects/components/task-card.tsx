import { Card, CardContent } from "@/components/ui/card";

import { Task } from "@/renderer/lib/placeholders";
import { TaskCardHeader } from "./task-card-header";
import { TaskCardLabels } from "./task-card-labels";
import { TaskCardAssignee } from "./task-card-assignee";
import { TaskCardDescription } from "./task-card-description";
import { TaskCardTimeTracking } from "./task-card-time-tracking";
import { TaskCardDueDateSection } from "./task-card-due-date-section";
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
        <TaskCardDescription description={task.description} />
        <TaskCardLabels labels={task.labels} />
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <TaskCardDueDateSection 
            task={task}
            daysUntilDue={daysUntilDue}
            isOverdue={isOverdue}
            isDueSoon={isDueSoon}
          />
          <TaskCardTimeTracking task={task} />
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
