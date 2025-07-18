// Legacy compatibility layer - import from new structure
// TODO: Update all imports to use @/lib/mock-data directly

export * from "./mock-data";

// Re-export for backwards compatibility
export { fileExplorerPlaceholders } from "./mock-data/files";
export { taskColumns, getTasksByStatus } from "./mock-data/tasks";
export { mockTerminalLines } from "./mock-data/terminal";
