import type { DocFile } from "../mocks/mock-doc-files";

/**
 * Filters documentation files by a search term.
 * The search is case-insensitive and matches name, path, or content.
 * @param docs Array of documentation files
 * @param searchTerm Search string
 * @returns Filtered array of documentation files
 */
export function filterDocsBySearchTerm(docs: DocFile[], searchTerm: string): DocFile[] {
  const lower = searchTerm.toLowerCase();
  return docs.filter(
    (doc) =>
      doc.name.toLowerCase().includes(lower) ||
      doc.path.toLowerCase().includes(lower) ||
      doc.content.toLowerCase().includes(lower)
  );
}

/**
 * Returns the content of the documentation file matching the given path.
 * @param docs Array of documentation files
 * @param path Path of the file to find
 * @returns File content if found, otherwise null
 */
export function getDocContentByPath(docs: DocFile[], path: string | null): string | null {
  if (!path) return null;
  return docs.find((doc) => doc.path === path)?.content ?? null;
}