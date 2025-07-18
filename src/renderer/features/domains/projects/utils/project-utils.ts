import type { Task } from "@/lib/mock-data/types";
import { StringUtils, ColorUtils } from "../shared-utils";

export const ProjectUtils = {
  generateSlug: StringUtils.generateSlug,

  isValidName: (name: string): boolean => {
    return (
      StringUtils.normalize(name).length >= 2 &&
      StringUtils.normalize(name).length <= 100
    );
  },

  calculateProgress: (tasks: Task[]): number => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(
      (task) => task.status === "completed",
    ).length;
    return Math.round((completedTasks / tasks.length) * 100);
  },

  getStatusColor: ColorUtils.getStatusColor,
} as const;
