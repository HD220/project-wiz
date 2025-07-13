// Shared string manipulation utilities

export class StringUtils {
  /**
   * Capitalizes the first letter of a string
   */
  static capitalize(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  /**
   * Converts a string to title case
   */
  static toTitleCase(text: string): string {
    if (!text) return '';
    return text
      .split(' ')
      .map(word => this.capitalize(word))
      .join(' ');
  }

  /**
   * Converts camelCase to kebab-case
   */
  static camelToKebab(text: string): string {
    return text.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Converts kebab-case to camelCase
   */
  static kebabToCamel(text: string): string {
    return text.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * Converts snake_case to camelCase
   */
  static snakeToCamel(text: string): string {
    return text.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * Truncates text to a specified length with ellipsis
   */
  static truncate(text: string, maxLength: number, suffix = '...'): string {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Removes extra whitespace and normalizes spacing
   */
  static normalizeWhitespace(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * Converts text to a URL-friendly slug
   */
  static slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Generates initials from a name
   */
  static getInitials(name: string, maxLength = 2): string {
    if (!name) return '';
    
    const words = name.trim().split(/\s+/);
    const initials = words
      .slice(0, maxLength)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
    
    return initials;
  }

  /**
   * Masks sensitive information (like API keys)
   */
  static maskSensitive(text: string, visibleChars = 4, maskChar = '*'): string {
    if (!text || text.length <= visibleChars) return text;
    
    const visible = text.slice(-visibleChars);
    const masked = maskChar.repeat(Math.max(text.length - visibleChars, 4));
    
    return masked + visible;
  }

  /**
   * Escapes HTML characters
   */
  static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Removes HTML tags from text
   */
  static stripHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  /**
   * Generates a random string
   */
  static generateRandomString(length = 8, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Checks if a string contains only ASCII characters
   */
  static isAscii(text: string): boolean {
    return /^[\x00-\x7F]*$/.test(text);
  }

  /**
   * Counts words in a text
   */
  static wordCount(text: string): number {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Extracts file extension from filename
   */
  static getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot === -1 ? '' : filename.slice(lastDot + 1).toLowerCase();
  }

  /**
   * Formats bytes to human readable format
   */
  static formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}