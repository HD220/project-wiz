import type { DocFile } from "../types/doc-file";

export function filterDocsBySearchTerm(docs: DocFile[], searchTerm: string): DocFile[] {
  const lower = searchTerm.toLowerCase();
  return docs.filter(
    (doc) =>
      doc.name.toLowerCase().includes(lower) ||
      doc.path.toLowerCase().includes(lower) ||
      doc.content.toLowerCase().includes(lower)
  );
}

export function getDocContentByPath(docs: DocFile[], path: string | null): string | null {
  if (!path) return null;
  return docs.find((doc) => doc.path === path)?.content ?? null;
}