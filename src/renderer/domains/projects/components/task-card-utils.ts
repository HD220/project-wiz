import type { Task } from "@/lib/mock-data/types";
import { DateUtils, TaskUtils } from "@/lib/ui-utils";

// Re-export from consolidated utils
export const getDaysUntilDue = DateUtils.getDaysUntilDue;
export const getPriorityColor = TaskUtils.getPriorityColor;
