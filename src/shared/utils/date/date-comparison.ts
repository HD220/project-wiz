import { parseDate } from "./date-parsing";

export function isToday(date: Date | string): boolean {
  const dateObj = parseDate(date);
  const today = new Date();

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

export function isWithinDays(date: Date | string, days: number): boolean {
  const dateObj = parseDate(date);
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays >= 0 && diffDays <= days;
}
