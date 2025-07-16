import { Task } from "@/renderer/lib/placeholders";

import { TaskCardDueDate } from "./task-card-due-date";

interface TaskCardDueDateSectionProps {
  task: Task;
  daysUntilDue: number | null;
  isOverdue: boolean;
  isDueSoon: boolean;
}

export function TaskCardDueDateSection({
  task,
  daysUntilDue,
  isOverdue,
  isDueSoon,
}: TaskCardDueDateSectionProps) {
  return (
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
  );
}
