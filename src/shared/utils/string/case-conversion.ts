export class CaseConversion {
  static capitalize(text: string): string {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  static toTitleCase(text: string): string {
    if (!text) return "";
    return text
      .split(" ")
      .map((word) => this.capitalize(word))
      .join(" ");
  }

  static camelToKebab(text: string): string {
    return text.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  }

  static kebabToCamel(text: string): string {
    return text.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  static snakeToCamel(text: string): string {
    return text.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }
}
