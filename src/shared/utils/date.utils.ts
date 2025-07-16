// Re-export all date utilities
export * from "./date/date-parsing";
export * from "./date/date-formatting";
export * from "./date/date-comparison";
export * from "./date/date-manipulation";

// Legacy class for backward compatibility
export class DateUtils {
  static formatForDisplay = formatForDisplay;
  static formatRelative = formatRelative;
  static isToday = isToday;
  static isWithinDays = isWithinDays;
  static toISOString = toISOString;
  static safeParse = safeParse;
  static startOfDay = startOfDay;
  static endOfDay = endOfDay;
}

// Import for re-export
import { isToday, isWithinDays } from "./date/date-comparison";
import { formatForDisplay, formatRelative } from "./date/date-formatting";
import { startOfDay, endOfDay } from "./date/date-manipulation";
import { toISOString, safeParse } from "./date/date-parsing";
