import {
  Project,
  Node,
  SourceFile,
  VariableStatement,
  SyntaxKind,
} from "ts-morph";
import path from "node:path";
import fg from "fast-glob";
import {
  BlockDependency,
  // BlockDependency,
  CodeBlockInfo,
  ExportInfo,
  FileAnalysisInfo,
  ImportInfo,
} from "./types";
import { createSHA256 } from "@/utils/createSHA256";
import { readFileSync } from "node:fs";

export class TypescriptRepositoryMapper {
  private projects: Map<
    string,
    { modules: string[]; fileAnalysis: FileAnalysisInfo[] }
  > = new Map();

  constructor() {}

  async loadRepository(repositoryRoot: string) {
    const files = await fg(
      fg.convertPathToPattern(path.join(repositoryRoot, "**", "tsconfig.json"))
    );
    if (files.length === 0)
      throw new Error("Nenhum arquivo tsconfig.json localizado");

    files.forEach((file) => {
      const project = new Project({
        tsConfigFilePath: file,
      });

      const projectPath = file.replace(path.basename(file), "").slice(0, -1);

      const packageJsonPath = path.resolve(projectPath, "./package.json");

      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

      this.projects.set(projectPath, {
        modules: Object.keys(packageJson.dependencies),
        fileAnalysis: project.getSourceFiles().map((sourceFile) => ({
          path: sourceFile.getFilePath().toString(),
          imports: this.extractImports(sourceFile),
          exports: this.extractExports(sourceFile),
          blocks: this.extractCodeBlocks(sourceFile),
        })),
      });
    });

    return Array.from(this.projects.entries()).map(([project, analysis]) => ({
      project,
      analysis,
    }));
  }

  private extractImports(sourceFile: SourceFile): ImportInfo[] {
    const imports: ImportInfo[] = sourceFile
      .getImportDeclarations()
      .map((imp) => ({
        moduleSpecifier: imp
          .getModuleSpecifierSourceFile()
          ?.getFilePath()
          .includes("node_modules")
          ? imp.getModuleSpecifierValue()
          : imp.getModuleSpecifierSourceFile()?.getFilePath() ||
            imp.getModuleSpecifierValue(),

        namespace: imp
          .getDefaultImport()
          ?.getSymbol()
          ?.getDeclarations()?.[0]
          .getSymbol()
          ?.getName(),
        elements: imp.getDefaultImport()
          ? [
              imp
                .getDefaultImport()
                ?.getSymbol()
                ?.getDeclarations()?.[0]
                .getSymbol()
                ?.getName() || "",
            ]
          : imp.getNamespaceImport()
            ? [imp.getNamespaceImport()?.getText() || ""]
            : imp.getNamedImports().map((named) => named.getName()),
        isDefault: !!imp.getDefaultImport(),
      }));

    return imports;
  }

  private extractExports(sourceFile: SourceFile): ExportInfo[] {
    const exports: ExportInfo[] = [];

    for (const [name, declarations] of sourceFile.getExportedDeclarations()) {
      declarations.map((exp) => {
        const isReexport = exp.getSourceFile() !== sourceFile; // Verifica se é uma reexportação
        const moduleSpecifier = isReexport
          ? exp.getSourceFile().getFilePath()
          : ""; // Caminho do módulo original

        exports.push({
          name: name === "default" ? "default" : name,
          type: name === "default" ? "default" : "named",
          from: moduleSpecifier,
          namespace: exp.getSymbol()?.getEscapedName() || "",
        });
      });
    }

    return exports;
  }

  private isValidBlock(node?: Node) {
    return (
      Node.isFunctionDeclaration(node) ||
      Node.isClassDeclaration(node) ||
      Node.isMethodDeclaration(node) ||
      Node.isInterfaceDeclaration(node) ||
      Node.isTypeAliasDeclaration(node) ||
      Node.isVariableDeclaration(node) ||
      Node.isVariableStatement(node)
    );
  }

  private extractDependencies(node: Node): BlockDependency[] {
    const blocksDep: BlockDependency[] = [];

    if (Node.isVariableStatement(node)) {
      this.extractVariableStatement(node).forEach(() => {});
    } else {
      if (this.isValidBlock(node) && !Node.isVariableStatement(node)) {
        const imports = this.extractImports(node.getSourceFile());
        const blockName = node.getName();

        node.forEachDescendant((child) => {
          if (Node.isIdentifier(child)) {
            const references = child.getDefinitionNodes();
            references.forEach((reference) => {
              if (
                this.isValidBlock(reference) &&
                !Node.isMethodDeclaration(reference)
              ) {
                if (Node.isVariableStatement(reference)) {
                  //
                } else {
                  if (
                    child.getParentIfKind(SyntaxKind.PropertyAccessExpression)
                  ) {
                    const objectName = child
                      .getParentIfKind(SyntaxKind.PropertyAccessExpression)
                      ?.getExpression()
                      .getText();
                    if (
                      node
                        .getSourceFile()
                        .getVariableDeclarations()
                        .some((v) => v.getName() === objectName)
                    ) {
                      return;
                    }
                  }

                  const importedFrom = imports.filter((imp) =>
                    imp.elements.includes(reference.getName() || "")
                  );

                  const sourceFile = reference.getSourceFile();
                  const sourcePath = sourceFile.getFilePath().toString();

                  const imported =
                    importedFrom.flatMap((obj) => obj.moduleSpecifier)[0] ||
                    sourcePath;

                  if (
                    imported.includes("node_modules/typescript/lib/") ||
                    imported.includes("node_modules/@types/node/")
                  )
                    return;

                  const blocks = this.extractValidBlock(reference);
                  blocks?.forEach(({ dependencies, content, ...ref }) => {
                    if (ref.name === blockName) return;
                    if (!blocksDep.some((bd) => bd.hash === ref.hash)) {
                      blocksDep.push({ ...ref, path: imported });
                    }
                  });
                }
              }
            });
          }
        });
      }
    }

    return blocksDep;
  }

  private extractValidBlock(node: Node): CodeBlockInfo[] | null {
    if (!this.isValidBlock(node)) return null;
    if (Node.isVariableStatement(node))
      return this.extractVariableStatement(node);

    const sourceFile = node.getSourceFile();

    return [
      {
        hash: createSHA256(
          sourceFile.getFilePath().toString() + node.getText()
        ),
        name: node.getName() || "",
        kind: node.getKindName(),
        content: node.getText(),
        start: node.getStartLineNumber(),
        end: node.getEndLineNumber(),
        dependencies: [],
      },
    ];
  }

  private extractVariableStatement(node: Node): CodeBlockInfo[] {
    if (!Node.isVariableStatement(node)) return [];

    const path = node.getSourceFile().getFilePath().toString();

    return node.getDeclarations().map((dec) => {
      return {
        hash: createSHA256(path + node.getText() + dec.getName()),
        name: dec.getName(),
        kind: node.getKindName(),
        content: node.getText(),
        start: node.getStartLineNumber(),
        end: node.getEndLineNumber(),
        dependencies: [],
      };
    });
  }

  private extractCodeBlocks(sourceFile: SourceFile): CodeBlockInfo[] {
    const blocks: CodeBlockInfo[] = [];

    sourceFile.forEachChild((node) => {
      const validBlocks = this.extractValidBlock(node);
      validBlocks?.forEach((block) => {
        const dependencies = this.extractDependencies(node);

        blocks.push({
          ...block,
          dependencies,
        });
      });
    });

    return blocks;
  }
}
