export function validateChannelName(name: string): string {
  // Placeholder for actual validation logic
  if (!name || name.trim() === "") {
    throw new Error("Channel name cannot be empty.");
  }
  return name;
}

export function isValidChannelName(name: string): boolean {
  // Placeholder for actual validation logic
  return name && name.trim() !== "";
}

export function normalizeChannelName(name: string): string {
  // Placeholder for actual normalization logic
  return name.trim().toLowerCase();
}
