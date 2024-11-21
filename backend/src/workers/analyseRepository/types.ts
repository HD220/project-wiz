export type WorkerInputData = {
  step?: "read-files" | "extract-blocks" | "versioning" | "completed";
  result?: any;
  commitHash: string;
  owner: string;
  name: string;
};

export type WorkerOutputData = object | null | void;
