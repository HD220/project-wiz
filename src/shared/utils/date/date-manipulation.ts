import { parseDate } from "./date-parsing";

export function startOfDay(date: Date | string): Date {
  const dateObj = parseDate(date);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj;
}

export function endOfDay(date: Date | string): Date {
  const dateObj = parseDate(date);
  dateObj.setHours(23, 59, 59, 999);
  return dateObj;
}
