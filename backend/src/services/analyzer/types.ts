export type ImportInfo = {
  moduleSpecifier: string;
  elements: string[];
  isDefault: boolean;
};

export type ExportInfo = {
  name: string;
  type: string;
  from?: string;
  namespace?: string;
};

export type BlockDependency = {
  path: string;
  hash: string;
  name: string;
  kind?: string;
};

export type CodeBlockInfo = {
  hash: string;
  name: string;
  kind: string;
  content?: string;
  start: number;
  end: number;
  dependencies?: BlockDependency[];
};

export type FileAnalysisInfo = {
  path: string;
  imports: ImportInfo[];
  exports: ExportInfo[];
  blocks: CodeBlockInfo[];
};

export type ModuleNode = {
  id: string;
  name: string;
  resolution: number;
  submodules: (ModuleNode | CodeBlockInfo)[];
};

export type ProjectAnalysis = {
  project: string;
  analysis: {
    modules: string[];
    fileAnalysis: FileAnalysisInfo[];
  };
};
