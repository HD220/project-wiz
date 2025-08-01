// Worker utilities
export function generateJobId(): string {
  return crypto.randomUUID();
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}