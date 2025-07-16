import { cn } from "@/lib/utils";

export function getMessageItemStyles(
  mentions?: string[],
) {
  return cn(
    "group hover:bg-gray-600/30 p-2 rounded relative",
    mentions?.includes("user") &&
      "bg-yellow-500/10 border-l-2 border-yellow-500",
  );
}
