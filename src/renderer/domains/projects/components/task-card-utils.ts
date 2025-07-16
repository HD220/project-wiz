import { Task } from "@/renderer/lib/placeholders";

export const getDaysUntilDue = (dueDate?: Date) => {
  if (!dueDate) return null;
  const now = new Date();
  const diff = dueDate.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days;
};

export const getPriorityColor = (priority: Task["priority"]) => {
  switch (priority) {
    case "urgent":
      return "destructive";
    case "high":
      return "default";
    case "medium":
      return "secondary";
    case "low":
      return "outline";
    default:
      return "secondary";
  }
};
