import { PromptData } from "../../infrastructure/db/promptRepository";
import { v4 as uuidv4 } from "uuid";

export interface ExportedPromptPackage {
  prompts: PromptData[];
  checksum: string;
}

/**
 * Gera um checksum simples baseado no conteúdo JSON dos prompts.
 * Pode ser substituído por assinatura digital no futuro.
 */
export function generateChecksum(prompts: PromptData[]): string {
  const json = JSON.stringify(prompts);
  let hash = 0;
  for (let i = 0; i < json.length; i++) {
    const chr = json.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Converte para 32 bits
  }
  return hash.toString();
}

/**
 * Exporta prompts com checksum para garantir integridade.
 */
export function exportPromptsWithChecksum(prompts: PromptData[]): ExportedPromptPackage {
  const checksum = generateChecksum(prompts);
  return { prompts, checksum };
}

/**
 * Valida o pacote importado, conferindo integridade e formato.
 * Lança erro se inválido.
 */
export function validateImportedPackage(pkg: ExportedPromptPackage): void {
  if (!pkg.prompts || !Array.isArray(pkg.prompts)) {
    throw new Error("Pacote inválido: prompts ausentes ou formato incorreto.");
  }
  const expectedChecksum = generateChecksum(pkg.prompts);
  if (expectedChecksum !== pkg.checksum) {
    throw new Error("Falha na validação: checksum não confere. O arquivo pode estar corrompido ou adulterado.");
  }
}

/**
 * Gera um token UUID para compartilhamento seguro.
 */
export function generateShareToken(): string {
  return uuidv4();
}