import { TaskCardDueDate } from "./task-card-due-date";

import type { Task } from "@/lib/mock-data/types";

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
