export function parseDate(date: Date | string): Date {
  return typeof date === "string" ? new Date(date) : date;
}

export function safeParse(dateString: string): Date | null {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

export function toISOString(date?: Date): string {
  return (date || new Date()).toISOString();
}
