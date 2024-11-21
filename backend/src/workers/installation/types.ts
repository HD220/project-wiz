export type WorkerInputData = {
  step?: "cloning" | "collecting" | "versioning" | "completed";
  result?: {
    repositories: {
      commitHash: string;
      name: string;
      owner: string;
    }[];
  };
  repositories: {
    name: string;
    owner: string;
  }[];
};

export type WorkerOutputData = object | null | void;
