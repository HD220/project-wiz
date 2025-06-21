import { Result } from "@/shared/result";
import { DocumentVersion } from "./document.interface";

export interface IAuditService {
  scanDocuments(): Promise<Result<DocumentVersion[]>>;
  validateConsistency(documentId: string): Promise<Result<boolean>>;
  generateMetrics(documentId: string): Promise<Result<Record<string, unknown>>>;
}
