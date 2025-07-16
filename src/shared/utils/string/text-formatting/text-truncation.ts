export class TextTruncation {
  static truncate(text: string, maxLength: number, suffix = "..."): string {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength - suffix.length) + suffix;
  }

  static normalizeWhitespace(text: string): string {
    return text.replace(/\s+/g, " ").trim();
  }

  static wordCount(text: string): number {
    if (!text) return 0;
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }
}
