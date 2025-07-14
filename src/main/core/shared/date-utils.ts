/**
 * Date utility functions for common date operations with Zod validation
 * Provides consistent date handling across the application
 */

import { z } from "zod";

/**
 * Time unit constants in milliseconds
 */
export const TimeUnits = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Date format options
 */
export interface DateFormatOptions {
  locale?: string;
  timeZone?: string;
  includeTime?: boolean;
  format?: "short" | "medium" | "long" | "full";
}

/**
 * Duration result interface
 */
export interface Duration {
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

/**
 * Comprehensive date utilities class with Zod validation
 * Provides common date operations with proper error handling and validation
 */
export class DateUtils {
  /**
   * Common Zod schemas for date validation
   */
  public static readonly schemas = {
    date: z.date(),
    pastDate: z
      .date()
      .refine((date) => date < new Date(), "Date must be in the past"),
    futureDate: z
      .date()
      .refine((date) => date > new Date(), "Date must be in the future"),
    isoString: z.string().refine((str) => {
      try {
        const date = new Date(str);
        return !isNaN(date.getTime());
      } catch {
        return false;
      }
    }, "Invalid ISO date string"),

    // Date range validation
    dateRange: z
      .object({
        start: z.date(),
        end: z.date(),
      })
      .refine(
        (data) => data.start <= data.end,
        "Start date must be before or equal to end date",
      ),

    // Time unit validation
    timeUnit: z.enum([
      "milliseconds",
      "seconds",
      "minutes",
      "hours",
      "days",
      "weeks",
      "months",
      "years",
    ]),

    // Duration validation
    duration: z.object({
      years: z.number().int().nonnegative(),
      months: z.number().int().nonnegative(),
      weeks: z.number().int().nonnegative(),
      days: z.number().int().nonnegative(),
      hours: z.number().int().nonnegative(),
      minutes: z.number().int().nonnegative(),
      seconds: z.number().int().nonnegative(),
      milliseconds: z.number().int().nonnegative(),
    }),

    // Format options validation
    formatOptions: z.object({
      locale: z.string().optional(),
      timeZone: z.string().optional(),
      includeTime: z.boolean().optional(),
      format: z.enum(["short", "medium", "long", "full"]).optional(),
    }),
  };

  /**
   * Validates a value as a date using Zod
   * @param value - Value to validate
   * @param schema - Optional custom schema
   * @returns Validated date
   */
  public static validateDate(
    value: unknown,
    schema: z.ZodDate = this.schemas.date,
  ): Date {
    return schema.parse(value);
  }

  /**
   * Safely validates and converts a value to date
   * @param value - Value to validate
   * @param defaultValue - Default value if validation fails
   * @returns Validated date or default
   */
  public static safeDate(
    value: unknown,
    defaultValue: Date = new Date(),
  ): Date {
    try {
      return this.validateDate(value);
    } catch {
      return defaultValue;
    }
  }

  /**
   * Validates an ISO string and converts to date
   * @param isoString - ISO string to validate
   * @returns Validated date
   */
  public static validateISOString(isoString: string): Date {
    this.schemas.isoString.parse(isoString);
    return new Date(isoString);
  }

  /**
   * Validates a date range
   * @param start - Start date
   * @param end - End date
   * @returns Validated date range
   */
  public static validateDateRange(
    start: Date,
    end: Date,
  ): { start: Date; end: Date } {
    return this.schemas.dateRange.parse({ start, end });
  }
  /**
   * Gets the current date and time
   * @returns Current date
   */
  public static now(): Date {
    return new Date();
  }

  /**
   * Gets the current date at midnight (start of day)
   * @returns Current date at 00:00:00
   */
  public static today(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  /**
   * Gets tomorrow's date at midnight
   * @returns Tomorrow's date at 00:00:00
   */
  public static tomorrow(): Date {
    const today = this.today();
    return this.addDays(today, 1);
  }

  /**
   * Gets yesterday's date at midnight
   * @returns Yesterday's date at 00:00:00
   */
  public static yesterday(): Date {
    const today = this.today();
    return this.addDays(today, -1);
  }

  /**
   * Creates a date from ISO string safely with Zod validation
   * @param isoString - ISO date string
   * @returns Date object or null if invalid
   */
  public static fromISOString(isoString: string): Date | null {
    try {
      if (!isoString) return null;
      return this.validateISOString(isoString);
    } catch {
      return null;
    }
  }

  /**
   * Converts date to ISO string safely with Zod validation
   * @param date - Date to convert
   * @returns ISO string or null if invalid
   */
  public static toISOString(date: Date): string | null {
    try {
      const validatedDate = this.validateDate(date);
      return validatedDate.toISOString();
    } catch {
      return null;
    }
  }

  /**
   * Validates if a date is valid
   * @param date - Date to validate
   * @returns True if valid, false otherwise
   */
  public static isValidDate(date: any): date is Date {
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Checks if a date is in the past
   * @param date - Date to check
   * @returns True if in the past, false otherwise
   */
  public static isPast(date: Date): boolean {
    if (!this.isValidDate(date)) return false;
    return date.getTime() < Date.now();
  }

  /**
   * Checks if a date is in the future
   * @param date - Date to check
   * @returns True if in the future, false otherwise
   */
  public static isFuture(date: Date): boolean {
    if (!this.isValidDate(date)) return false;
    return date.getTime() > Date.now();
  }

  /**
   * Checks if a date is today
   * @param date - Date to check
   * @returns True if today, false otherwise
   */
  public static isToday(date: Date): boolean {
    if (!this.isValidDate(date)) return false;
    const today = this.today();
    return this.isSameDay(date, today);
  }

  /**
   * Checks if two dates are the same day
   * @param date1 - First date
   * @param date2 - Second date
   * @returns True if same day, false otherwise
   */
  public static isSameDay(date1: Date, date2: Date): boolean {
    if (!this.isValidDate(date1) || !this.isValidDate(date2)) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Adds days to a date
   * @param date - Base date
   * @param days - Number of days to add (can be negative)
   * @returns New date with days added
   */
  public static addDays(date: Date, days: number): Date {
    if (!this.isValidDate(date)) throw new Error("Invalid date");
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Adds hours to a date
   * @param date - Base date
   * @param hours - Number of hours to add (can be negative)
   * @returns New date with hours added
   */
  public static addHours(date: Date, hours: number): Date {
    if (!this.isValidDate(date)) throw new Error("Invalid date");
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  }

  /**
   * Adds minutes to a date
   * @param date - Base date
   * @param minutes - Number of minutes to add (can be negative)
   * @returns New date with minutes added
   */
  public static addMinutes(date: Date, minutes: number): Date {
    if (!this.isValidDate(date)) throw new Error("Invalid date");
    const result = new Date(date);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
  }

  /**
   * Adds seconds to a date
   * @param date - Base date
   * @param seconds - Number of seconds to add (can be negative)
   * @returns New date with seconds added
   */
  public static addSeconds(date: Date, seconds: number): Date {
    if (!this.isValidDate(date)) throw new Error("Invalid date");
    const result = new Date(date);
    result.setSeconds(result.getSeconds() + seconds);
    return result;
  }

  /**
   * Adds milliseconds to a date
   * @param date - Base date
   * @param milliseconds - Number of milliseconds to add (can be negative)
   * @returns New date with milliseconds added
   */
  public static addMilliseconds(date: Date, milliseconds: number): Date {
    if (!this.isValidDate(date)) throw new Error("Invalid date");
    return new Date(date.getTime() + milliseconds);
  }

  /**
   * Gets the start of day for a date
   * @param date - Date to get start of day for
   * @returns Date at 00:00:00
   */
  public static startOfDay(date: Date): Date {
    if (!this.isValidDate(date)) throw new Error("Invalid date");
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  /**
   * Gets the end of day for a date
   * @param date - Date to get end of day for
   * @returns Date at 23:59:59.999
   */
  public static endOfDay(date: Date): Date {
    if (!this.isValidDate(date)) throw new Error("Invalid date");
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999,
    );
  }

  /**
   * Gets the start of month for a date
   * @param date - Date to get start of month for
   * @returns Date at first day of month
   */
  public static startOfMonth(date: Date): Date {
    if (!this.isValidDate(date)) throw new Error("Invalid date");
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  /**
   * Gets the end of month for a date
   * @param date - Date to get end of month for
   * @returns Date at last day of month
   */
  public static endOfMonth(date: Date): Date {
    if (!this.isValidDate(date)) throw new Error("Invalid date");
    return new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
  }

  /**
   * Calculates the difference between two dates
   * @param date1 - First date
   * @param date2 - Second date
   * @returns Difference in milliseconds (date1 - date2)
   */
  public static diff(date1: Date, date2: Date): number {
    if (!this.isValidDate(date1) || !this.isValidDate(date2)) {
      throw new Error("Invalid date(s)");
    }
    return date1.getTime() - date2.getTime();
  }

  /**
   * Calculates the difference between two dates in days
   * @param date1 - First date
   * @param date2 - Second date
   * @returns Difference in days
   */
  public static diffInDays(date1: Date, date2: Date): number {
    return Math.floor(this.diff(date1, date2) / TimeUnits.DAY);
  }

  /**
   * Calculates the difference between two dates in hours
   * @param date1 - First date
   * @param date2 - Second date
   * @returns Difference in hours
   */
  public static diffInHours(date1: Date, date2: Date): number {
    return Math.floor(this.diff(date1, date2) / TimeUnits.HOUR);
  }

  /**
   * Calculates the difference between two dates in minutes
   * @param date1 - First date
   * @param date2 - Second date
   * @returns Difference in minutes
   */
  public static diffInMinutes(date1: Date, date2: Date): number {
    return Math.floor(this.diff(date1, date2) / TimeUnits.MINUTE);
  }

  /**
   * Calculates the difference between two dates in seconds
   * @param date1 - First date
   * @param date2 - Second date
   * @returns Difference in seconds
   */
  public static diffInSeconds(date1: Date, date2: Date): number {
    return Math.floor(this.diff(date1, date2) / TimeUnits.SECOND);
  }

  /**
   * Calculates detailed duration between two dates
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Duration object with years, months, days, etc.
   */
  public static duration(startDate: Date, endDate: Date): Duration {
    if (!this.isValidDate(startDate) || !this.isValidDate(endDate)) {
      throw new Error("Invalid date(s)");
    }

    const diffMs = Math.abs(this.diff(endDate, startDate));

    const years = Math.floor(diffMs / TimeUnits.YEAR);
    const months = Math.floor((diffMs % TimeUnits.YEAR) / TimeUnits.MONTH);
    const weeks = Math.floor((diffMs % TimeUnits.MONTH) / TimeUnits.WEEK);
    const days = Math.floor((diffMs % TimeUnits.WEEK) / TimeUnits.DAY);
    const hours = Math.floor((diffMs % TimeUnits.DAY) / TimeUnits.HOUR);
    const minutes = Math.floor((diffMs % TimeUnits.HOUR) / TimeUnits.MINUTE);
    const seconds = Math.floor((diffMs % TimeUnits.MINUTE) / TimeUnits.SECOND);
    const milliseconds = diffMs % TimeUnits.SECOND;

    return {
      years,
      months,
      weeks,
      days,
      hours,
      minutes,
      seconds,
      milliseconds,
    };
  }

  /**
   * Formats a date for display with Zod validation
   * @param date - Date to format
   * @param options - Format options
   * @returns Formatted date string
   */
  public static format(date: Date, options: DateFormatOptions = {}): string {
    try {
      const validatedDate = this.validateDate(date);
      const validatedOptions = this.schemas.formatOptions.parse(options);

      const {
        locale = "en-US",
        timeZone = "UTC",
        includeTime = false,
        format = "medium",
      } = validatedOptions;

      const formatOptions: Intl.DateTimeFormatOptions = {
        timeZone,
        year: "numeric",
        month:
          format === "short" ? "short" : format === "long" ? "long" : "2-digit",
        day: "2-digit",
      };

      if (includeTime) {
        formatOptions.hour = "2-digit";
        formatOptions.minute = "2-digit";
        formatOptions.second = "2-digit";
      }

      try {
        return new Intl.DateTimeFormat(locale, formatOptions).format(
          validatedDate,
        );
      } catch {
        return validatedDate.toISOString();
      }
    } catch {
      return "Invalid Date";
    }
  }

  /**
   * Formats a date as a relative time string (e.g., "2 hours ago")
   * @param date - Date to format
   * @param baseDate - Base date to compare against (defaults to now)
   * @returns Relative time string
   */
  public static formatRelative(
    date: Date,
    baseDate: Date = new Date(),
  ): string {
    if (!this.isValidDate(date)) return "Invalid Date";
    if (!this.isValidDate(baseDate)) baseDate = new Date();

    const diffMs = this.diff(baseDate, date);
    const absMs = Math.abs(diffMs);
    const isPast = diffMs > 0;

    if (absMs < TimeUnits.MINUTE) {
      return "Just now";
    } else if (absMs < TimeUnits.HOUR) {
      const minutes = Math.floor(absMs / TimeUnits.MINUTE);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ${isPast ? "ago" : "from now"}`;
    } else if (absMs < TimeUnits.DAY) {
      const hours = Math.floor(absMs / TimeUnits.HOUR);
      return `${hours} hour${hours > 1 ? "s" : ""} ${isPast ? "ago" : "from now"}`;
    } else if (absMs < TimeUnits.WEEK) {
      const days = Math.floor(absMs / TimeUnits.DAY);
      return `${days} day${days > 1 ? "s" : ""} ${isPast ? "ago" : "from now"}`;
    } else if (absMs < TimeUnits.MONTH) {
      const weeks = Math.floor(absMs / TimeUnits.WEEK);
      return `${weeks} week${weeks > 1 ? "s" : ""} ${isPast ? "ago" : "from now"}`;
    } else if (absMs < TimeUnits.YEAR) {
      const months = Math.floor(absMs / TimeUnits.MONTH);
      return `${months} month${months > 1 ? "s" : ""} ${isPast ? "ago" : "from now"}`;
    }
    const years = Math.floor(absMs / TimeUnits.YEAR);
    return `${years} year${years > 1 ? "s" : ""} ${isPast ? "ago" : "from now"}`;
  }

  /**
   * Checks if a year is a leap year
   * @param year - Year to check
   * @returns True if leap year, false otherwise
   */
  public static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /**
   * Gets the number of days in a month
   * @param year - Year
   * @param month - Month (0-11)
   * @returns Number of days in the month
   */
  public static getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  /**
   * Gets the day of the year for a date
   * @param date - Date to get day of year for
   * @returns Day of year (1-366)
   */
  public static getDayOfYear(date: Date): number {
    if (!this.isValidDate(date)) throw new Error("Invalid date");
    const start = new Date(date.getFullYear(), 0, 1);
    return Math.floor((date.getTime() - start.getTime()) / TimeUnits.DAY) + 1;
  }

  /**
   * Gets the week number of the year for a date
   * @param date - Date to get week number for
   * @returns Week number (1-53)
   */
  public static getWeekNumber(date: Date): number {
    if (!this.isValidDate(date)) throw new Error("Invalid date");
    const d = new Date(date.getTime());
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    return (
      1 +
      Math.round(
        ((d.getTime() - week1.getTime()) / TimeUnits.DAY -
          3 +
          ((week1.getDay() + 6) % 7)) /
          7,
      )
    );
  }

  /**
   * Clamps a date between min and max dates
   * @param date - Date to clamp
   * @param min - Minimum date
   * @param max - Maximum date
   * @returns Clamped date
   */
  public static clamp(date: Date, min: Date, max: Date): Date {
    if (!this.isValidDate(date)) throw new Error("Invalid date");
    if (!this.isValidDate(min)) throw new Error("Invalid min date");
    if (!this.isValidDate(max)) throw new Error("Invalid max date");

    if (date.getTime() < min.getTime()) return new Date(min);
    if (date.getTime() > max.getTime()) return new Date(max);
    return new Date(date);
  }

  /**
   * Checks if a date is between two other dates
   * @param date - Date to check
   * @param start - Start date
   * @param end - End date
   * @param inclusive - Whether to include start/end dates
   * @returns True if between, false otherwise
   */
  public static isBetween(
    date: Date,
    start: Date,
    end: Date,
    inclusive: boolean = true,
  ): boolean {
    if (
      !this.isValidDate(date) ||
      !this.isValidDate(start) ||
      !this.isValidDate(end)
    ) {
      return false;
    }

    const dateTime = date.getTime();
    const startTime = start.getTime();
    const endTime = end.getTime();

    if (inclusive) {
      return dateTime >= startTime && dateTime <= endTime;
    }
    return dateTime > startTime && dateTime < endTime;
  }

  /**
   * Validates if a date is in the past using Zod
   * @param date - Date to validate
   * @returns True if date is in past and valid, false otherwise
   */
  public static isValidPastDate(date: Date): boolean {
    try {
      this.schemas.pastDate.parse(date);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates if a date is in the future using Zod
   * @param date - Date to validate
   * @returns True if date is in future and valid, false otherwise
   */
  public static isValidFutureDate(date: Date): boolean {
    try {
      this.schemas.futureDate.parse(date);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates if a string is a valid ISO date string using Zod
   * @param str - String to validate
   * @returns True if valid ISO date string, false otherwise
   */
  public static isValidISOString(str: string): boolean {
    try {
      this.schemas.isoString.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates if a date range is valid using Zod
   * @param start - Start date
   * @param end - End date
   * @returns True if valid date range, false otherwise
   */
  public static isValidDateRange(start: Date, end: Date): boolean {
    try {
      this.schemas.dateRange.parse({ start, end });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates a duration object using Zod
   * @param duration - Duration object to validate
   * @returns True if valid duration, false otherwise
   */
  public static isValidDuration(duration: Duration): boolean {
    try {
      this.schemas.duration.parse(duration);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Creates a validated past date
   * @param date - Date to validate
   * @returns Validated past date
   * @throws ZodError if validation fails
   */
  public static requirePastDate(date: Date): Date {
    return this.schemas.pastDate.parse(date);
  }

  /**
   * Creates a validated future date
   * @param date - Date to validate
   * @returns Validated future date
   * @throws ZodError if validation fails
   */
  public static requireFutureDate(date: Date): Date {
    return this.schemas.futureDate.parse(date);
  }

  /**
   * Creates a validated date range
   * @param start - Start date
   * @param end - End date
   * @returns Validated date range
   * @throws ZodError if validation fails
   */
  public static requireDateRange(
    start: Date,
    end: Date,
  ): { start: Date; end: Date } {
    return this.schemas.dateRange.parse({ start, end });
  }

  /**
   * Creates a validated duration
   * @param duration - Duration to validate
   * @returns Validated duration
   * @throws ZodError if validation fails
   */
  public static requireDuration(duration: Duration): Duration {
    return this.schemas.duration.parse(duration);
  }

  /**
   * Validates and safely adds days to a date
   * @param date - Base date
   * @param days - Number of days to add
   * @returns New date with days added
   */
  public static safeAddDays(date: Date, days: number): Date {
    try {
      const validatedDate = this.validateDate(date);
      const validatedDays = z.number().int().parse(days);
      const result = new Date(validatedDate);
      result.setDate(result.getDate() + validatedDays);
      return result;
    } catch {
      return new Date();
    }
  }

  /**
   * Validates and safely adds hours to a date
   * @param date - Base date
   * @param hours - Number of hours to add
   * @returns New date with hours added
   */
  public static safeAddHours(date: Date, hours: number): Date {
    try {
      const validatedDate = this.validateDate(date);
      const validatedHours = z.number().int().parse(hours);
      const result = new Date(validatedDate);
      result.setHours(result.getHours() + validatedHours);
      return result;
    } catch {
      return new Date();
    }
  }

  /**
   * Validates and safely calculates difference between dates
   * @param date1 - First date
   * @param date2 - Second date
   * @returns Difference in milliseconds or 0 if invalid
   */
  public static safeDiff(date1: Date, date2: Date): number {
    try {
      const validatedDate1 = this.validateDate(date1);
      const validatedDate2 = this.validateDate(date2);
      return validatedDate1.getTime() - validatedDate2.getTime();
    } catch {
      return 0;
    }
  }
}
