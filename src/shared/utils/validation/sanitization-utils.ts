export class SanitizationUtils {
  static sanitizeString(value: string): string {
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/[<>]/g, "")
      .trim();
  }
}
