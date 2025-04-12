function isErrorWithMessage(value: unknown): value is { message: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof (value as any).message === "string"
  );
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function handleAuthError(authError: unknown, fallbackMessage: string): string {
  if (isErrorWithMessage(authError)) {
    return authError.message;
  }
  if (isString(authError)) {
    return authError;
  }
  if (authError === null || authError === undefined) {
    return fallbackMessage;
  }
  if (Array.isArray(authError)) {
    return fallbackMessage;
  }
  if (isObject(authError)) {
    try {
      return JSON.stringify(authError);
    } catch {
      return fallbackMessage;
    }
  }
  return fallbackMessage;
}