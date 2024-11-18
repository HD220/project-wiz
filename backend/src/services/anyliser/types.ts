export type BlockInfo = {
  kind: string;
  name: string;
  source: string;
  blockHash: string;
  externalDependencies: Record<
    string,
    {
      filePath: string;
      type: "import" | "local";
    }
  >;
  start: number;
  end: number;
};

export type FileAnalysis = {
  filePath: string;
  imports: {
    name: string;
    path: string;
  }[];
  exports: string[];
  blocks: BlockInfo[];
};
