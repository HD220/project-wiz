/**
 * Executes an async function with automatic retries and exponential backoff.
 * @param operation Async function to execute.
 * @param maxRetries Maximum number of retries (default: 3).
 * @param initialDelay Initial delay in ms (default: 500).
 * @param backoffFactor Delay multiplier (default: 2).
 * @returns Result of the async function, or throws the last error after all retries.
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 500,
  backoffFactor = 2
): Promise<T> {
  let attempt = 0;
  let delay = initialDelay;
  let lastError: unknown;

  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      attempt++;
      if (attempt >= maxRetries) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= backoffFactor;
    }
  }

  throw lastError;
}

/**
 * Formats an ISO date string to a human-readable date (e.g., "Jun 15, 2023").
 * Uses "en-US" locale explicitly for consistency and security.
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats an ISO date string to a human-readable time and date (e.g., "14:30 Jun 15").
 * Uses "en-US" locale explicitly for consistency and security.
 * @param dateString ISO date string
 * @returns Formatted time and date string
 */
export function formatDateTime(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const time = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const day = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${time} ${day}`;
}