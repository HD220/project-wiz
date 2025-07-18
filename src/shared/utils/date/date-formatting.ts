import { parseDate } from "./date-parsing";

export function formatForDisplay(date: Date | string): string {
  const dateObj = parseDate(date);

  if (isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}

function getTimeUnits(dateObj: Date) {
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  return { diffMins, diffHours, diffDays };
}

function formatTimeUnit(value: number, unit: string): string {
  return `${value} ${unit}${value === 1 ? "" : "s"} ago`;
}

export function formatRelative(date: Date | string): string {
  const dateObj = parseDate(date);

  if (isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  const { diffMins, diffHours, diffDays } = getTimeUnits(dateObj);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return formatTimeUnit(diffMins, "minute");
  if (diffHours < 24) return formatTimeUnit(diffHours, "hour");
  if (diffDays < 7) return formatTimeUnit(diffDays, "day");

  return formatForDisplay(dateObj);
}
