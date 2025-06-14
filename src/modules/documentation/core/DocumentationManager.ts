import { Result } from "../../../shared/result";
import { DocumentVersion } from "@/modules/documentation/interfaces/document.interface";
import { IAuditService } from "@/modules/documentation/interfaces/audit-service.interface";
import { IValidationEngine } from "@/modules/documentation/interfaces/validation-engine.interface";
import { OK, NOK } from "@/shared/result";

export class DocumentationManager {
  constructor(
    private readonly auditService: IAuditService,
    private readonly validationEngine: IValidationEngine
  ) {}

  async createVersion(
    path: string,
    content: string,
    author: string
  ): Promise<Result<DocumentVersion>> {
    try {
      // Gera hash do conteúdo para controle de versão
      const hash = await this.generateContentHash(content);

      // Extrai metadados básicos do documento
      const metadata = {
        links: this.extractLinks(content),
        terms: this.extractTerms(content),
        examples: this.countExamples(content),
      };

      // Cria objeto de versão
      const version: DocumentVersion = {
        id: crypto.randomUUID(),
        path,
        content,
        hash,
        createdAt: new Date(),
        author,
        metadata,
      };

      // Executa validações iniciais
      const validationResult = await this.validationEngine.checkLinks(
        version.id
      );
      if (!validationResult.success) {
        return NOK(validationResult.error);
      }

      return OK(version);
    } catch (error) {
      return NOK(
        new Error(
          `Failed to create document version: ${error instanceof Error ? error.message : String(error)}`
        )
      );
    }
  }

  private async generateContentHash(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  private extractLinks(content: string): string[] {
    const linkRegex = /\[.*?\]\((.*?)\)/g;
    const matches = content.matchAll(linkRegex);
    return Array.from(matches).map((match) => match[1]);
  }

  private extractTerms(content: string): string[] {
    const termRegex = /(?:\*\*|__)(.*?)(?:\*\*|__)/g;
    const matches = content.matchAll(termRegex);
    return Array.from(matches).map((match) => match[1]);
  }

  private countExamples(content: string): number {
    const exampleRegex = /```[\s\S]*?```/g;
    const matches = content.match(exampleRegex);
    return matches ? matches.length : 0;
  }

  async compareVersions(
    version1Id: string,
    version2Id: string
  ): Promise<Result<string>> {
    // Implementação será adicionada posteriormente
    throw new Error("Not implemented");
  }

  async generateReport(documentId: string): Promise<Result<string>> {
    // Implementação será adicionada posteriormente
    throw new Error("Not implemented");
  }

  async notifyChanges(documentId: string): Promise<Result<void>> {
    // Implementação será adicionada posteriormente
    throw new Error("Not implemented");
  }
}
