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

/**
 * Formats a timestamp to display relative time or time of day
 * Returns "HH:MM" for today, "X dias" for older messages
 */
export function getTimeAgo(createdAt: Date | string): string {
  try {
    const messageDate = new Date(createdAt);
    const now = new Date();
    const diffInHours =
      (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }).format(messageDate);
    }

    const days = Math.floor(diffInHours / 24);
    return `${days} dias`;
  } catch {
    return "agora";
  }
}
