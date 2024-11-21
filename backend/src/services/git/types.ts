export type GitFileStatus =
  | "A" // Added
  | "M" // Modified
  | "D" // Deleted
  | "R" // Renamed
  | "C" // Copied
  | "T" // Type changed
  | "U"; // Unmerged

export type GitDiffEntry = {
  status: GitFileStatus;
  path: string;
  from?: string;
  similarity?: number;
};
