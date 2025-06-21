import { Result } from "@/shared/result";
import { DocumentVersion } from "./document.interface";

export interface IValidationEngine {
  checkLinks(documentId: string): Promise<Result<boolean>>;
  validateTerminology(documentId: string): Promise<Result<boolean>>;
  verifyExamples(documentId: string): Promise<Result<boolean>>;
}
