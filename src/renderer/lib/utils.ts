import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export everything from UI utils for convenience
export * from "./ui-utils";

// Legacy function for backward compatibility
export function getAgentStatusColor(status: string) {
  return StatusUtils.getAgentStatusColor(status as any);
}
