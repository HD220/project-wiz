/**
 * String utility functions for common string operations with Zod validation
 * Provides consistent string manipulation across the application
 */

import { z } from "zod";

/**
 * Case transformation options
 */
export type CaseTransform =
  | "lower"
  | "upper"
  | "title"
  | "sentence"
  | "camel"
  | "pascal"
  | "snake"
  | "kebab";

/**
 * Truncation options
 */
export interface TruncateOptions {
  length: number;
  omission?: string;
  separator?: string;
}

/**
 * Slug generation options
 */
export interface SlugOptions {
  separator?: string;
  lower?: boolean;
  strict?: boolean;
  trim?: boolean;
}

/**
 * Comprehensive string utilities class with Zod validation
 * Provides common string operations with proper error handling and validation
 */
export class StringUtils {
  /**
   * Common Zod schemas for string validation
   */
  public static readonly schemas = {
    string: z.string(),
    nonEmptyString: z.string().min(1, "String cannot be empty"),
    trimmedString: z.string().trim(),
    email: z.string().email("Invalid email format"),
    url: z.string().url("Invalid URL format"),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),

    // Length validation schemas
    minLength: (min: number) =>
      z.string().min(min, `String must be at least ${min} characters`),
    maxLength: (max: number) =>
      z.string().max(max, `String must not exceed ${max} characters`),
    length: (min: number, max: number) => z.string().min(min).max(max),

    // Pattern validation schemas
    alphanumeric: z
      .string()
      .regex(
        /^[a-zA-Z0-9]+$/,
        "String must contain only alphanumeric characters",
      ),
    alpha: z
      .string()
      .regex(/^[a-zA-Z]+$/, "String must contain only alphabetic characters"),
    numeric: z
      .string()
      .regex(/^[0-9]+$/, "String must contain only numeric characters"),

    // Case validation schemas
    lowercase: z.string().regex(/^[a-z]*$/, "String must be lowercase"),
    uppercase: z.string().regex(/^[A-Z]*$/, "String must be uppercase"),

    // Truncation options schema
    truncateOptions: z.object({
      length: z.number().int().positive("Length must be a positive integer"),
      omission: z.string().optional(),
      separator: z.string().optional(),
    }),

    // Slug options schema
    slugOptions: z.object({
      separator: z.string().optional(),
      lower: z.boolean().optional(),
      strict: z.boolean().optional(),
      trim: z.boolean().optional(),
    }),
  };

  /**
   * Validates a value as a string using Zod
   * @param value - Value to validate
   * @param schema - Optional custom schema
   * @returns Validated string
   */
  public static validateString(
    value: unknown,
    schema: z.ZodString = this.schemas.string,
  ): string {
    return schema.parse(value);
  }

  /**
   * Safely validates and converts a value to string
   * @param value - Value to validate
   * @param defaultValue - Default value if validation fails
   * @returns Validated string or default
   */
  public static safeString(value: unknown, defaultValue: string = ""): string {
    try {
      return this.validateString(value);
    } catch {
      return defaultValue;
    }
  }
  /**
   * Checks if a value is a string
   * @param value - Value to check
   * @returns True if string, false otherwise
   */
  public static isString(value: any): value is string {
    return typeof value === "string";
  }

  /**
   * Checks if a string is empty or null/undefined
   * @param str - String to check
   * @returns True if empty, false otherwise
   */
  public static isEmpty(str: any): boolean {
    return str === null || str === undefined || str === "";
  }

  /**
   * Checks if a string is blank (empty or only whitespace)
   * @param str - String to check
   * @returns True if blank, false otherwise
   */
  public static isBlank(str: any): boolean {
    return this.isEmpty(str) || (this.isString(str) && str.trim() === "");
  }

  /**
   * Checks if a string is not empty
   * @param str - String to check
   * @returns True if not empty, false otherwise
   */
  public static isNotEmpty(str: any): boolean {
    return !this.isEmpty(str);
  }

  /**
   * Checks if a string is not blank
   * @param str - String to check
   * @returns True if not blank, false otherwise
   */
  public static isNotBlank(str: any): boolean {
    return !this.isBlank(str);
  }

  /**
   * Safely trims a string
   * @param str - String to trim
   * @returns Trimmed string or empty string if input is invalid
   */
  public static trim(str: any): string {
    if (!this.isString(str)) return "";
    return str.trim();
  }

  /**
   * Safely gets the length of a string
   * @param str - String to measure
   * @returns Length of string or 0 if input is invalid
   */
  public static length(str: any): number {
    if (!this.isString(str)) return 0;
    return str.length;
  }

  /**
   * Truncates a string to a specified length with Zod validation
   * @param str - String to truncate
   * @param options - Truncation options
   * @returns Truncated string
   */
  public static truncate(str: string, options: TruncateOptions): string {
    const validatedStr = this.safeString(str);
    const validatedOptions = this.schemas.truncateOptions.parse(options);

    if (!validatedStr) return "";

    const { length, omission = "...", separator } = validatedOptions;

    if (validatedStr.length <= length) return validatedStr;

    let truncated = validatedStr.substring(0, length - omission.length);

    if (separator) {
      const lastSeparatorIndex = truncated.lastIndexOf(separator);
      if (lastSeparatorIndex > 0) {
        truncated = truncated.substring(0, lastSeparatorIndex);
      }
    }

    return truncated + omission;
  }

  /**
   * Capitalizes the first letter of a string
   * @param str - String to capitalize
   * @returns Capitalized string
   */
  public static capitalize(str: string): string {
    if (!this.isString(str) || str.length === 0) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Converts string to title case
   * @param str - String to convert
   * @returns Title case string
   */
  public static toTitleCase(str: string): string {
    if (!this.isString(str)) return "";
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
    );
  }

  /**
   * Converts string to sentence case
   * @param str - String to convert
   * @returns Sentence case string
   */
  public static toSentenceCase(str: string): string {
    if (!this.isString(str) || str.length === 0) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Converts string to camelCase
   * @param str - String to convert
   * @returns camelCase string
   */
  public static toCamelCase(str: string): string {
    if (!this.isString(str)) return "";
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase(),
      )
      .replace(/\s+/g, "");
  }

  /**
   * Converts string to PascalCase
   * @param str - String to convert
   * @returns PascalCase string
   */
  public static toPascalCase(str: string): string {
    if (!this.isString(str)) return "";
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
      .replace(/\s+/g, "");
  }

  /**
   * Converts string to snake_case
   * @param str - String to convert
   * @returns snake_case string
   */
  public static toSnakeCase(str: string): string {
    if (!this.isString(str)) return "";
    return str
      .replace(/\W+/g, " ")
      .split(/ |\B(?=[A-Z])/)
      .map((word) => word.toLowerCase())
      .join("_");
  }

  /**
   * Converts string to kebab-case
   * @param str - String to convert
   * @returns kebab-case string
   */
  public static toKebabCase(str: string): string {
    if (!this.isString(str)) return "";
    return str
      .replace(/\W+/g, " ")
      .split(/ |\B(?=[A-Z])/)
      .map((word) => word.toLowerCase())
      .join("-");
  }

  /**
   * Transforms string case based on specified transform type
   * @param str - String to transform
   * @param transform - Type of transformation
   * @returns Transformed string
   */
  public static transformCase(str: string, transform: CaseTransform): string {
    if (!this.isString(str)) return "";

    switch (transform) {
      case "lower":
        return str.toLowerCase();
      case "upper":
        return str.toUpperCase();
      case "title":
        return this.toTitleCase(str);
      case "sentence":
        return this.toSentenceCase(str);
      case "camel":
        return this.toCamelCase(str);
      case "pascal":
        return this.toPascalCase(str);
      case "snake":
        return this.toSnakeCase(str);
      case "kebab":
        return this.toKebabCase(str);
      default:
        return str;
    }
  }

  /**
   * Creates a URL-friendly slug from a string with Zod validation
   * @param str - String to convert to slug
   * @param options - Slug options
   * @returns URL-friendly slug
   */
  public static slug(str: string, options: SlugOptions = {}): string {
    const validatedStr = this.safeString(str);
    const validatedOptions = this.schemas.slugOptions.parse(options);

    if (!validatedStr) return "";

    const {
      separator = "-",
      lower = true,
      strict = false,
      trim = true,
    } = validatedOptions;

    let result = validatedStr;

    // Convert to lowercase if requested
    if (lower) {
      result = result.toLowerCase();
    }

    // Remove accents and special characters
    result = result.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (strict) {
      // Strict mode: only allow alphanumeric and separator
      result = result.replace(/[^a-zA-Z0-9\s]/g, "");
    } else {
      // Normal mode: remove most special characters but keep some
      result = result.replace(/[^\w\s\-_.]/g, "");
    }

    // Replace spaces and multiple separators with single separator
    result = result
      .replace(/[\s\-_.]+/g, separator)
      .replace(new RegExp(`\\${separator}+`, "g"), separator);

    // Trim separators from start and end if requested
    if (trim) {
      result = result.replace(
        new RegExp(`^\\${separator}+|\\${separator}+$`, "g"),
        "",
      );
    }

    return result;
  }

  /**
   * Pads a string to a specified length
   * @param str - String to pad
   * @param length - Target length
   * @param padString - String to use for padding
   * @param padLeft - Whether to pad left (true) or right (false)
   * @returns Padded string
   */
  public static pad(
    str: string,
    length: number,
    padString: string = " ",
    padLeft: boolean = false,
  ): string {
    if (!this.isString(str)) return "";

    const padLength = length - str.length;
    if (padLength <= 0) return str;

    const pad = padString
      .repeat(Math.ceil(padLength / padString.length))
      .substring(0, padLength);

    return padLeft ? pad + str : str + pad;
  }

  /**
   * Pads a string on the left
   * @param str - String to pad
   * @param length - Target length
   * @param padString - String to use for padding
   * @returns Left-padded string
   */
  public static padLeft(
    str: string,
    length: number,
    padString: string = " ",
  ): string {
    return this.pad(str, length, padString, true);
  }

  /**
   * Pads a string on the right
   * @param str - String to pad
   * @param length - Target length
   * @param padString - String to use for padding
   * @returns Right-padded string
   */
  public static padRight(
    str: string,
    length: number,
    padString: string = " ",
  ): string {
    return this.pad(str, length, padString, false);
  }

  /**
   * Repeats a string a specified number of times
   * @param str - String to repeat
   * @param count - Number of times to repeat
   * @returns Repeated string
   */
  public static repeat(str: string, count: number): string {
    if (!this.isString(str) || count < 0) return "";
    return str.repeat(count);
  }

  /**
   * Reverses a string
   * @param str - String to reverse
   * @returns Reversed string
   */
  public static reverse(str: string): string {
    if (!this.isString(str)) return "";
    return str.split("").reverse().join("");
  }

  /**
   * Checks if a string contains another string (case-insensitive option)
   * @param str - String to search in
   * @param searchString - String to search for
   * @param ignoreCase - Whether to ignore case
   * @returns True if contains, false otherwise
   */
  public static contains(
    str: string,
    searchString: string,
    ignoreCase: boolean = false,
  ): boolean {
    if (!this.isString(str) || !this.isString(searchString)) return false;

    const haystack = ignoreCase ? str.toLowerCase() : str;
    const needle = ignoreCase ? searchString.toLowerCase() : searchString;

    return haystack.includes(needle);
  }

  /**
   * Checks if a string starts with another string (case-insensitive option)
   * @param str - String to check
   * @param searchString - String to search for
   * @param ignoreCase - Whether to ignore case
   * @returns True if starts with, false otherwise
   */
  public static startsWith(
    str: string,
    searchString: string,
    ignoreCase: boolean = false,
  ): boolean {
    if (!this.isString(str) || !this.isString(searchString)) return false;

    const haystack = ignoreCase ? str.toLowerCase() : str;
    const needle = ignoreCase ? searchString.toLowerCase() : searchString;

    return haystack.startsWith(needle);
  }

  /**
   * Checks if a string ends with another string (case-insensitive option)
   * @param str - String to check
   * @param searchString - String to search for
   * @param ignoreCase - Whether to ignore case
   * @returns True if ends with, false otherwise
   */
  public static endsWith(
    str: string,
    searchString: string,
    ignoreCase: boolean = false,
  ): boolean {
    if (!this.isString(str) || !this.isString(searchString)) return false;

    const haystack = ignoreCase ? str.toLowerCase() : str;
    const needle = ignoreCase ? searchString.toLowerCase() : searchString;

    return haystack.endsWith(needle);
  }

  /**
   * Counts occurrences of a substring in a string
   * @param str - String to search in
   * @param searchString - String to count
   * @param ignoreCase - Whether to ignore case
   * @returns Number of occurrences
   */
  public static countOccurrences(
    str: string,
    searchString: string,
    ignoreCase: boolean = false,
  ): number {
    if (
      !this.isString(str) ||
      !this.isString(searchString) ||
      searchString.length === 0
    )
      return 0;

    const haystack = ignoreCase ? str.toLowerCase() : str;
    const needle = ignoreCase ? searchString.toLowerCase() : searchString;

    let count = 0;
    let position = 0;

    while ((position = haystack.indexOf(needle, position)) !== -1) {
      count++;
      position += needle.length;
    }

    return count;
  }

  /**
   * Replaces all occurrences of a string with another string
   * @param str - String to perform replacement on
   * @param searchValue - String to replace
   * @param replaceValue - String to replace with
   * @param ignoreCase - Whether to ignore case
   * @returns String with replacements
   */
  public static replaceAll(
    str: string,
    searchValue: string,
    replaceValue: string,
    ignoreCase: boolean = false,
  ): string {
    if (!this.isString(str) || !this.isString(searchValue)) return str;

    const flags = ignoreCase ? "gi" : "g";
    const regex = new RegExp(this.escapeRegExp(searchValue), flags);

    return str.replace(regex, replaceValue);
  }

  /**
   * Escapes special characters in a string for use in regex
   * @param str - String to escape
   * @returns Escaped string
   */
  public static escapeRegExp(str: string): string {
    if (!this.isString(str)) return "";
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * Removes HTML tags from a string
   * @param str - String to clean
   * @returns String without HTML tags
   */
  public static stripHtml(str: string): string {
    if (!this.isString(str)) return "";
    return str.replace(/<[^>]*>/g, "");
  }

  /**
   * Extracts numbers from a string
   * @param str - String to extract numbers from
   * @returns Array of numbers found in string
   */
  public static extractNumbers(str: string): number[] {
    if (!this.isString(str)) return [];

    const matches = str.match(/-?\d+\.?\d*/g);
    return matches ? matches.map(Number).filter((n) => !isNaN(n)) : [];
  }

  /**
   * Extracts words from a string
   * @param str - String to extract words from
   * @returns Array of words
   */
  public static extractWords(str: string): string[] {
    if (!this.isString(str)) return [];

    const matches = str.match(/\b\w+\b/g);
    return matches || [];
  }

  /**
   * Generates a random string
   * @param length - Length of string to generate
   * @param charset - Character set to use
   * @returns Random string
   */
  public static random(
    length: number,
    charset: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  ): string {
    if (length <= 0) return "";

    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

  /**
   * Generates a random alphanumeric string
   * @param length - Length of string to generate
   * @returns Random alphanumeric string
   */
  public static randomAlphanumeric(length: number): string {
    return this.random(
      length,
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    );
  }

  /**
   * Generates a random alphabetic string
   * @param length - Length of string to generate
   * @returns Random alphabetic string
   */
  public static randomAlpha(length: number): string {
    return this.random(
      length,
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    );
  }

  /**
   * Generates a random numeric string
   * @param length - Length of string to generate
   * @returns Random numeric string
   */
  public static randomNumeric(length: number): string {
    return this.random(length, "0123456789");
  }

  /**
   * Compares two strings for similarity using Levenshtein distance
   * @param str1 - First string
   * @param str2 - Second string
   * @returns Similarity ratio (0-1)
   */
  public static similarity(str1: string, str2: string): number {
    if (!this.isString(str1) || !this.isString(str2)) return 0;
    if (str1 === str2) return 1;

    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1;

    const distance = this.levenshteinDistance(str1, str2);
    return (maxLength - distance) / maxLength;
  }

  /**
   * Calculates Levenshtein distance between two strings
   * @param str1 - First string
   * @param str2 - Second string
   * @returns Levenshtein distance
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Masks sensitive information in a string with Zod validation
   * @param str - String to mask
   * @param visibleChars - Number of characters to leave visible at start and end
   * @param maskChar - Character to use for masking
   * @returns Masked string
   */
  public static mask(
    str: string,
    visibleChars: number = 4,
    maskChar: string = "*",
  ): string {
    const validatedStr = this.safeString(str);
    const validatedVisibleChars = z
      .number()
      .int()
      .nonnegative()
      .parse(visibleChars);
    const validatedMaskChar = z.string().min(1).parse(maskChar);

    if (!validatedStr) return "";
    if (validatedStr.length <= validatedVisibleChars * 2)
      return validatedMaskChar.repeat(validatedStr.length);

    const start = validatedStr.substring(0, validatedVisibleChars);
    const end = validatedStr.substring(
      validatedStr.length - validatedVisibleChars,
    );
    const middle = validatedMaskChar.repeat(
      validatedStr.length - validatedVisibleChars * 2,
    );

    return start + middle + end;
  }

  /**
   * Validates if a string is a valid email using Zod
   * @param str - String to validate
   * @returns True if valid email, false otherwise
   */
  public static isValidEmail(str: string): boolean {
    try {
      this.schemas.email.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates if a string is a valid URL using Zod
   * @param str - String to validate
   * @returns True if valid URL, false otherwise
   */
  public static isValidUrl(str: string): boolean {
    try {
      this.schemas.url.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates if a string is a valid slug using Zod
   * @param str - String to validate
   * @returns True if valid slug, false otherwise
   */
  public static isValidSlug(str: string): boolean {
    try {
      this.schemas.slug.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates if a string contains only alphanumeric characters using Zod
   * @param str - String to validate
   * @returns True if alphanumeric, false otherwise
   */
  public static isAlphanumeric(str: string): boolean {
    try {
      this.schemas.alphanumeric.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates if a string contains only alphabetic characters using Zod
   * @param str - String to validate
   * @returns True if alphabetic, false otherwise
   */
  public static isAlpha(str: string): boolean {
    try {
      this.schemas.alpha.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates if a string contains only numeric characters using Zod
   * @param str - String to validate
   * @returns True if numeric, false otherwise
   */
  public static isNumeric(str: string): boolean {
    try {
      this.schemas.numeric.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates string length using Zod
   * @param str - String to validate
   * @param min - Minimum length
   * @param max - Maximum length (optional)
   * @returns True if length is valid, false otherwise
   */
  public static isValidLength(str: string, min: number, max?: number): boolean {
    try {
      const schema =
        max !== undefined
          ? this.schemas.length(min, max)
          : this.schemas.minLength(min);
      schema.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Creates a validated string with minimum length requirement
   * @param str - String to validate
   * @param minLength - Minimum length required
   * @returns Validated string
   * @throws ZodError if validation fails
   */
  public static requireMinLength(str: string, minLength: number): string {
    return this.schemas.minLength(minLength).parse(str);
  }

  /**
   * Creates a validated string with maximum length requirement
   * @param str - String to validate
   * @param maxLength - Maximum length allowed
   * @returns Validated string
   * @throws ZodError if validation fails
   */
  public static requireMaxLength(str: string, maxLength: number): string {
    return this.schemas.maxLength(maxLength).parse(str);
  }

  /**
   * Creates a validated non-empty string
   * @param str - String to validate
   * @returns Validated non-empty string
   * @throws ZodError if validation fails
   */
  public static requireNonEmpty(str: string): string {
    return this.schemas.nonEmptyString.parse(str);
  }

  /**
   * Creates a validated and trimmed string
   * @param str - String to validate and trim
   * @returns Validated and trimmed string
   * @throws ZodError if validation fails
   */
  public static requireTrimmed(str: string): string {
    return this.schemas.trimmedString.parse(str);
  }
}
