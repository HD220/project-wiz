import { Result } from "@/shared/result";
import { IAuditService } from "../interfaces/audit-service.interface";
import { DocumentVersion } from "../interfaces/document.interface";

export class AuditService implements IAuditService {
  async scanDocuments(): Promise<Result<DocumentVersion[]>> {
    // Implementação será adicionada posteriormente
    throw new Error("Not implemented");
  }

  async validateConsistency(documentId: string): Promise<Result<boolean>> {
    // Implementação será adicionada posteriormente
    throw new Error("Not implemented");
  }

  async generateMetrics(
    documentId: string
  ): Promise<Result<Record<string, unknown>>> {
    // Implementação será adicionada posteriormente
    throw new Error("Not implemented");
  }
}
