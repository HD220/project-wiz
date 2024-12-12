import { Project, Node, SourceFile, ImportDeclaration } from "ts-morph";
import path from "node:path";
import fg from "fast-glob";
import fs from "node:fs";
import { createSHA256 } from "@/utils/createSHA256";
import {
  BlockDependency,
  CodeBlockInfo,
  ExportInfo,
  FileAnalysisInfo,
  ImportInfo,
  ProjectAnalysis,
} from "./types";

export class RepositoryAnalyzer {
  private projects: Map<
    string,
    {
      modules: string[];
      fileAnalysis: FileAnalysisInfo[];
    }
  > = new Map();

  async analyzeRepository(repositoryRoot: string): Promise<ProjectAnalysis[]> {
    const tsconfigFiles = await fg(
      fg.convertPathToPattern(path.join(repositoryRoot, "**", "tsconfig.json"))
    );

    if (tsconfigFiles.length === 0) {
      throw new Error("No tsconfig.json files found");
    }

    for (const tsconfigPath of tsconfigFiles) {
      const projectPath = path.dirname(tsconfigPath);
      const packageJsonPath = path.resolve(projectPath, "package.json");

      try {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, "utf8")
        );
        const project = new Project({
          tsConfigFilePath: tsconfigPath,
          skipLoadingLibFiles: true,
          skipFileDependencyResolution: false,
        });

        this.projects.set(projectPath, {
          modules: Object.keys(packageJson.dependencies || {}),
          fileAnalysis: this.analyzeProjectFiles(project),
        });
      } catch (error) {
        console.error(`Error processing project ${projectPath}:`, error);
      }
    }

    return Array.from(this.projects.entries()).map(([project, analysis]) => ({
      project,
      analysis,
    }));
  }

  private analyzeProjectFiles(project: Project): FileAnalysisInfo[] {
    return project.getSourceFiles().map((sourceFile) => ({
      path: sourceFile.getFilePath().toString(),
      imports: this.extractImports(sourceFile),
      exports: this.extractExports(sourceFile),
      blocks: this.extractCodeBlocks(sourceFile),
    }));
  }

  private extractImports(sourceFile: SourceFile): ImportInfo[] {
    return sourceFile
      .getImportDeclarations()
      .map((imp) => this.processImportDeclaration(imp));
  }

  private processImportDeclaration(imp: ImportDeclaration): ImportInfo {
    const moduleSpecifier = this.resolveImportModuleSpecifier(imp);

    const elements = this.extractImportElements(imp);

    const isDefault = !!imp.getDefaultImport();

    return {
      moduleSpecifier,
      elements,
      isDefault,
    };
  }

  private resolveImportModuleSpecifier(imp: ImportDeclaration): string {
    const sourceFile = imp.getModuleSpecifierSourceFile();

    if (sourceFile) {
      return sourceFile.getFilePath().includes("node_modules")
        ? imp.getModuleSpecifierValue()
        : sourceFile.getFilePath().toString();
    }

    return imp.getModuleSpecifierValue();
  }

  private extractImportElements(imp: ImportDeclaration): string[] {
    const defaultImport = imp.getDefaultImport();
    if (defaultImport) {
      return [defaultImport.getText()];
    }

    const namespaceImport = imp.getNamespaceImport();
    if (namespaceImport) {
      return [namespaceImport.getText()];
    }

    return imp.getNamedImports().map((namedImport) => namedImport.getName());
  }

  private extractExports(sourceFile: SourceFile): ExportInfo[] {
    const exports: ExportInfo[] = [];

    for (const [name, declarations] of sourceFile.getExportedDeclarations()) {
      declarations.forEach((exp) => {
        const isReexport = exp.getSourceFile() !== sourceFile;
        const moduleSpecifier = isReexport
          ? exp.getSourceFile().getFilePath().toString()
          : "";

        exports.push({
          name: name === "default" ? "default" : name,
          type: name === "default" ? "default" : "named",
          from: moduleSpecifier,
          namespace: this.getExportNamespace(exp),
        });
      });
    }

    return exports;
  }

  private getExportNamespace(exp: Node): string {
    const symbol = exp.getSymbol();
    return symbol?.getEscapedName() || symbol?.getName() || "";
  }

  private extractCodeBlocks(sourceFile: SourceFile): CodeBlockInfo[] {
    const blocks: CodeBlockInfo[] = [];

    sourceFile.forEachChild((node) => {
      const validBlocks = this.extractValidBlock(node);
      validBlocks?.forEach((block) => {
        const dependencies = this.extractDependencies(node);
        blocks.push({ ...block, dependencies });
      });
    });

    return blocks;
  }

  private extractValidBlock(node: Node): CodeBlockInfo[] | null {
    const validChecks = [
      Node.isFunctionDeclaration,
      Node.isClassDeclaration,
      Node.isMethodDeclaration,
      Node.isInterfaceDeclaration,
      Node.isTypeAliasDeclaration,
      Node.isVariableDeclaration,
      Node.isVariableStatement,
    ];

    if (!validChecks.some((check) => check(node))) return null;

    if (Node.isVariableStatement(node)) {
      return this.extractVariableStatement(node);
    }

    const sourceFile = node.getSourceFile();
    return [
      {
        hash: createSHA256(
          sourceFile.getFilePath().toString() + node.getText()
        ),
        name: this.getNodeName(node),
        kind: node.getKindName(),
        content: node.getText(),
        start: node.getStartLineNumber(),
        end: node.getEndLineNumber(),
        dependencies: [],
      },
    ];
  }

  private getNodeName(node: Node): string {
    try {
      return (node as any).getName ? (node as any).getName() : "";
    } catch {
      return "";
    }
  }

  private extractVariableStatement(node: Node): CodeBlockInfo[] {
    if (!Node.isVariableStatement(node)) return [];

    const path = node.getSourceFile().getFilePath().toString();

    return node.getDeclarations().map((dec) => ({
      hash: createSHA256(path + dec.getText()),
      name: dec.getName(),
      kind: node.getKindName(),
      content: dec.getText(),
      start: node.getStartLineNumber(),
      end: node.getEndLineNumber(),
      dependencies: [],
    }));
  }

  private extractDependencies(node: Node): BlockDependency[] {
    const blockDependencies: BlockDependency[] = [];
    const sourceFile = node.getSourceFile();
    const imports = this.extractImports(sourceFile);
    const currentBlockText = node.getText();

    node.forEachDescendant((child) => {
      if (Node.isIdentifier(child)) {
        const references = child.getDefinitionNodes();

        references.forEach((reference) => {
          if (
            this.isValidReference(reference, node) &&
            !currentBlockText.includes(reference.getText())
          ) {
            const importedFrom = this.findImportedModule(imports, reference);

            const blocks = this.extractValidBlock(reference);
            blocks?.forEach((block) => {
              if (!blockDependencies.some((dep) => dep.hash === block.hash))
                blockDependencies.push({
                  ...block,
                  path: importedFrom || sourceFile.getFilePath().toString(),
                  hash: block.hash,
                  name: block.name,
                  kind: block.kind,
                });
            });
          }
        });
      }
    });

    return blockDependencies;
  }

  private isValidReference(reference: Node, originalNode: Node): boolean {
    const validReferenceTypes = [
      Node.isFunctionDeclaration,
      Node.isClassDeclaration,
      // Node.isMethodDeclaration,
      Node.isInterfaceDeclaration,
      Node.isTypeAliasDeclaration,
      Node.isVariableDeclarationList,
      Node.isVariableDeclaration,
      Node.isVariableStatement,
    ];

    return (
      validReferenceTypes.some((check) => check(reference)) &&
      reference !== originalNode &&
      !this.isSystemReference(reference)
    );
  }

  private isSystemReference(reference: Node): boolean {
    const systemPaths = [
      "node_modules/typescript/lib/",
      "node_modules/@types/node/",
    ];

    return systemPaths.some((path) =>
      reference.getSourceFile().getFilePath().toString().includes(path)
    );
  }

  private findImportedModule(
    imports: ImportInfo[],
    reference: Node
  ): string | undefined {
    const referenceName = this.getNodeName(reference);
    return imports
      .filter((imp) => imp.elements.includes(referenceName))
      .map((imp) => imp.moduleSpecifier)[0];
  }
}
