import { Task } from "@/renderer/lib/placeholders";

interface TaskCardTimeTrackingProps {
  task: Task;
}

export function TaskCardTimeTracking({ task }: TaskCardTimeTrackingProps) {
  if (!task.estimatedHours) return null;

  return (
    <div className="flex items-center gap-1">
      <span>{task.estimatedHours}h</span>
      {task.actualHours && (
        <span className="text-muted-foreground/60">/ {task.actualHours}h</span>
      )}
    </div>
  );
}
