/**
 * Biblioteca consolidada de utilitários para o renderer
 * Ponto central para todas as utilidades do frontend
 */

// Core utils
export * from "./utils";

// Specialized utils
export * from "./status-utils";
export * from "./date-utils";
export * from "./field-utils";
export * from "./domain-utils";
export * from "./ui-utils";

// Existing utils
export * from "./file-preview-utils";
export * from "./placeholders";

// Mock data (for development)
export * from "./mock-data";

// Legacy exports for backward compatibility
export { cn } from "./utils";
export { getAgentStatusColor } from "./utils";
export { fieldTransformers } from "./field-utils";
