export interface ValidationIssue {
  field: string;
  message: string;
  value?: unknown;
  constraint?: string;
}
