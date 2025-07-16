import { CaseConversion } from "./case-conversion";
import { FileUtils } from "./file-utils";
import { HtmlUtils } from "./html-utils";
import { StringGeneration } from "./string-generation";
import { TextFormatting } from "./text-formatting";

export class StringUtils {
  static capitalize = CaseConversion.capitalize;
  static toTitleCase = CaseConversion.toTitleCase;
  static camelToKebab = CaseConversion.camelToKebab;
  static kebabToCamel = CaseConversion.kebabToCamel;
  static snakeToCamel = CaseConversion.snakeToCamel;
  static truncate = TextFormatting.truncate;
  static normalizeWhitespace = TextFormatting.normalizeWhitespace;
  static slugify = TextFormatting.slugify;
  static getInitials = TextFormatting.getInitials;
  static maskSensitive = TextFormatting.maskSensitive;
  static wordCount = TextFormatting.wordCount;
  static isAscii = TextFormatting.isAscii;
  static escapeHtml = HtmlUtils.escapeHtml;
  static stripHtml = HtmlUtils.stripHtml;
  static generateRandomString = StringGeneration.generateRandomString;
  static getFileExtension = FileUtils.getFileExtension;
  static formatBytes = FileUtils.formatBytes;
}
