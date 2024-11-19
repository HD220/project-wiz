import ts from "typescript";
import { BlockInfo, FileAnalysis } from "./types";
import path from "node:path";
import { createHash } from "node:crypto";

class TypescriptAnalyzer {
  private pathLocation: string;
  private sourceFile: ts.SourceFile;
  private checker: ts.TypeChecker;

  constructor(workingDirectory: string, filePath: string) {
    this.pathLocation = path.resolve(workingDirectory, filePath);
    const program = ts.createProgram([this.pathLocation], {});
    this.checker = program.getTypeChecker();
    this.sourceFile = program.getSourceFile(this.pathLocation)!;
  }

  private analyzeImports(analysis: FileAnalysis): void {
    ts.forEachChild(this.sourceFile, (node) => {
      if (ts.isImportDeclaration(node)) {
        const importPath = (node.moduleSpecifier as ts.StringLiteral).text;
        if (node.importClause) {
          if (node.importClause.name) {
            analysis.imports.push({
              name: node.importClause.name.text,
              path: path.join(path.dirname(this.pathLocation), importPath),
            });
          }
          if (node.importClause.namedBindings) {
            if (ts.isNamedImports(node.importClause.namedBindings)) {
              node.importClause.namedBindings.elements.forEach((element) => {
                analysis.imports.push({
                  name: element.name.text,
                  path: path.join(path.dirname(this.pathLocation), importPath),
                });
              });
            }
          }
        }
      }
      // Analisar declarações de exportação inline
      if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
        const exportPath = (node.moduleSpecifier as ts.StringLiteral).text;
        if (node.exportClause && ts.isNamedExports(node.exportClause)) {
          node.exportClause.elements.forEach((element) => {
            analysis.imports.push({
              name: element.name.text,
              path: path.join(path.dirname(this.pathLocation), exportPath),
            });
          });
        }
      }
    });
  }

  private analyzeExport(
    node: ts.ExportDeclaration,
    analysis: FileAnalysis
  ): void {
    if (node.exportClause && ts.isNamedExports(node.exportClause)) {
      node.exportClause.elements.forEach((element) => {
        analysis.exports.push(element.name.text);
      });
    }
  }

  private analyzeBlock(node: ts.Node, analysis: FileAnalysis): void {
    const blockInfo: BlockInfo = {
      kind: ts.SyntaxKind[node.kind],
      name: this.getDeclarationName(node),
      source: node.getText(),
      blockHash: createHash("SHA512")
        .update(node.getText(), "utf-8")
        .digest("hex"),
      externalDependencies: {},
      start: node.getStart(),
      end: node.getEnd(),
    };

    // Encontrar dependências externas
    this.findExternalDependencies(node, blockInfo, analysis.imports);

    analysis.blocks.push(blockInfo);
  }

  private findExternalDependencies(
    node: ts.Node,
    blockInfo: BlockInfo,
    imports?: {
      name: string;
      path: string;
    }[]
  ): void {
    const visitNode = (node: ts.Node) => {
      if (ts.isPropertyAccessExpression(node)) {
        let current: ts.Node = node;
        while (ts.isPropertyAccessExpression(current)) {
          current = current.expression;
        }

        if (ts.isIdentifier(current)) {
          const symbol = this.checker.getSymbolAtLocation(current);
          if (symbol) {
            const declaration = symbol.declarations?.[0];
            if (declaration && !this.isInsideBlock(declaration, blockInfo)) {
              const from: "local" | "import" = imports?.some(
                ({ name }) => name === current.text
              )
                ? "import"
                : "local";
              let filePath = this.pathLocation;
              if (from === "import") {
                filePath =
                  imports?.find((i) => i.name === current.text)?.path || "";
              }
              blockInfo.externalDependencies[current.text] = {
                filePath,
                type: from,
              };
            }
          }
        }
      } else if (
        ts.isIdentifier(node) &&
        !ts.isPropertyAccessExpression(node.parent)
      ) {
        const symbol = this.checker.getSymbolAtLocation(node);
        if (symbol) {
          const declaration = symbol.declarations?.[0];
          if (declaration && !this.isInsideBlock(declaration, blockInfo)) {
            const from: "local" | "import" = imports?.some(
              ({ name }) => name === node.text
            )
              ? "import"
              : "local";
            let filePath = this.pathLocation;
            if (from === "import") {
              filePath = imports?.find((i) => i.name === node.text)?.path || "";
            }
            blockInfo.externalDependencies[node.text] = {
              filePath,
              type: from,
            };
          }
        }
      }

      ts.forEachChild(node, visitNode);
    };

    visitNode(node);
  }

  private isInsideBlock(node: ts.Node, blockInfo: BlockInfo): boolean {
    const pos = node.getStart();
    return pos >= blockInfo.start && pos <= blockInfo.end;
  }

  private isTopLevelDeclaration(node: ts.Node): boolean {
    return (
      ts.isFunctionDeclaration(node) ||
      ts.isClassDeclaration(node) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isTypeAliasDeclaration(node) ||
      ts.isVariableStatement(node)
    );
  }

  private getDeclarationName(node: ts.Node): string {
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isClassDeclaration(node) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isTypeAliasDeclaration(node)
    ) {
      return node.name?.text || "anonymous";
    } else if (ts.isVariableStatement(node)) {
      return node.declarationList.declarations[0].name.getText();
    }
    return "unknown";
  }

  public analyze(): FileAnalysis {
    const analysis: FileAnalysis = {
      filePath: this.pathLocation,
      imports: [],
      exports: [],
      blocks: [],
    };

    // Analisar imports
    this.analyzeImports(analysis);

    // Analisar exports e blocos principais
    ts.forEachChild(this.sourceFile, (node) => {
      if (ts.isExportDeclaration(node)) {
        this.analyzeExport(node, analysis);
      } else if (this.isTopLevelDeclaration(node)) {
        this.analyzeBlock(node, analysis);
      }
    });

    return analysis;
  }
}

export const createTypescriptAnalyser = (
  workingDirectory: string,
  filePath: string
) => new TypescriptAnalyzer(workingDirectory, filePath);
