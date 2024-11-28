export type ImportInfo = {
  moduleSpecifier: string;
  elements: string[];
  isDefault: boolean;
  // name: string;
  // alias: string;
  // path: string;
  // isNamespace: boolean;
  // isLib: boolean;
};

export type ExportInfo = {
  name: string;
  type: string;
  from?: string;
  namespace?: string;
  // isNamespace: boolean;
  // isDefault: boolean;
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
