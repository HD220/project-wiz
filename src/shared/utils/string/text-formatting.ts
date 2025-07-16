import { TextTransformation } from "./text-formatting/text-transformation";
import { TextTruncation } from "./text-formatting/text-truncation";

export class TextFormatting {
  static truncate = TextTruncation.truncate;
  static normalizeWhitespace = TextTruncation.normalizeWhitespace;
  static wordCount = TextTruncation.wordCount;
  static slugify = TextTransformation.slugify;
  static getInitials = TextTransformation.getInitials;
  static maskSensitive = TextTransformation.maskSensitive;
  static isAscii = TextTransformation.isAscii;
}
