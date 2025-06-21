import { Result } from "@/shared/result";
import { IValidationEngine } from "../interfaces/validation-engine.interface";
import { DocumentVersion } from "../interfaces/document.interface";

export class ValidationEngine implements IValidationEngine {
  async checkLinks(documentId: string): Promise<Result<boolean>> {
    // Implementação será adicionada posteriormente
    throw new Error("Not implemented");
  }

  async validateTerminology(documentId: string): Promise<Result<boolean>> {
    // Implementação será adicionada posteriormente
    throw new Error("Not implemented");
  }

  async verifyExamples(documentId: string): Promise<Result<boolean>> {
    // Implementação será adicionada posteriormente
    throw new Error("Not implemented");
  }
}
