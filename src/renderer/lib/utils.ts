import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates if a string is a valid URL
 * Returns the URL if valid, null if invalid or falsy
 */
export function isValidAvatarUrl(
  url: string | null | undefined,
): string | null {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    // Only allow http and https protocols for avatar URLs
    if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
      return url;
    }
    return null;
  } catch {
    // Invalid URL format
    return null;
  }
}
