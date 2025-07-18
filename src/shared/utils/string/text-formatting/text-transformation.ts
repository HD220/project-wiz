export class TextTransformation {
  static slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
      .replace(/^-|-$/g, "");
  }

  static getInitials(name: string, maxLength = 2): string {
    if (!name) return "";

    const words = name.trim().split(/\s+/);
    const initials = words
      .slice(0, maxLength)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");

    return initials;
  }

  static maskSensitive(text: string, visibleChars = 4, maskChar = "*"): string {
    if (!text || text.length <= visibleChars) return text;

    const visible = text.slice(-visibleChars);
    const masked = maskChar.repeat(Math.max(text.length - visibleChars, 4));

    return masked + visible;
  }

  static isAscii(text: string): boolean {
    // eslint-disable-next-line no-control-regex
    return /^[\x00-\x7F]*$/.test(text);
  }
}
