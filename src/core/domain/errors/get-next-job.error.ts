export class GetNextJobError extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = "GetNextJobError";
    this.cause = cause;
  }
}
