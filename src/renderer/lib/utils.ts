import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Agent } from "@/lib/placeholders";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAgentStatusColor(status: Agent["status"]) {
  switch (status) {
    case "online":
      return "bg-green-500";
    case "away":
      return "bg-yellow-500";
    case "busy":
      return "bg-red-500";
    case "executing":
      return "bg-blue-500";
    case "offline":
    default:
      return "bg-gray-400";
  }
}
