import { Project, SourceFile, Node, SyntaxKind } from "ts-morph";
import path from "path";

interface CodeBlock {
  name: string;
  kind: SyntaxKind;
  content: string;
  startLine: number;
  endLine: number;
}

interface Dependency {
  type: "import" | "function-call" | "class-reference";
  name: string;
  location?: string;
}

interface BlockDependencyInfo {
  block: CodeBlock;
  dependencies: {
    internal: string[];
    external: string[];
  };
  referencedBy: string[];
}

interface FileDependencyInfo {
  filePath: string;
  blocks: BlockDependencyInfo[];
  imports: Dependency[];
}

export class CodeDependencyExtractor {
  private project: Project;

  constructor(projectRootPath: string) {
    this.project = new Project({
      tsConfigFilePath: path.join(projectRootPath, "tsconfig.json"),
    });
  }

  extractProjectDependencies(): FileDependencyInfo[] {
    const sourceFiles = this.project.getSourceFiles();
    return sourceFiles.map((sourceFile) =>
      this.extractFileDependencies(sourceFile)
    );
  }

  private extractFileDependencies(sourceFile: SourceFile): FileDependencyInfo {
    const filePath = sourceFile.getFilePath();
    const imports = this.extractImports(sourceFile);
    const blocks = this.extractCodeBlocks(sourceFile);

    return {
      filePath,
      imports,
      blocks: blocks.map((block) =>
        this.analyzeBlockDependencies(block, sourceFile)
      ),
    };
  }

  private extractImports(sourceFile: SourceFile): Dependency[] {
    const imports: Dependency[] = [];

    sourceFile.getImportDeclarations().map((importDecl) => {
      importDecl.getModuleSpecifier();
      const namedImports = importDecl.getNamedImports();
      const path = importDecl
        .getModuleSpecifierSourceFile()
        ?.getFilePath()
        .toString();
      if (namedImports.length > 0) {
        namedImports.map((dec) => {
          imports.push({
            type: "import",
            name: dec.getName() || "",
            location: path?.includes("node_modules")
              ? importDecl.getModuleSpecifierValue()
              : path,
          });
        });
      } else {
        const importClause = importDecl.getImportClause()?.getText();
        const namespace = importDecl.getNamespaceImport()?.getText();

        const aliases = importDecl
          .getImportClause()
          ?.getNamedBindings()
          ?.getText();

        imports.push({
          type: "import",
          name: namespace || aliases || importClause || "",
          location: importDecl.getModuleSpecifierValue(),
        });
      }
    });

    return imports;
  }

  private extractCodeBlocks(sourceFile: SourceFile): CodeBlock[] {
    const blocks: CodeBlock[] = [];

    sourceFile.forEachChild((node) => {
      if (
        Node.isFunctionDeclaration(node) ||
        Node.isClassDeclaration(node) ||
        Node.isMethodDeclaration(node) ||
        Node.isInterfaceDeclaration(node) ||
        Node.isTypeAliasDeclaration(node)
      ) {
        blocks.push({
          name: node.getName() || "Anonymous",
          kind: node.getKind(),
          content: node.getText(),
          startLine: node.getStartLineNumber(),
          endLine: node.getEndLineNumber(),
        });
      }
    });

    return blocks;
  }

  private analyzeBlockDependencies(
    block: CodeBlock,
    sourceFile: SourceFile
  ): BlockDependencyInfo {
    const internalDependencies: Map<string, string> = new Map();
    const externalDependencies: Map<string, string> = new Map();
    const referencedBy: string[] = [];

    // Análise de chamadas de funções e referências
    sourceFile.forEachDescendant((descendant) => {
      if (Node.isCallExpression(descendant)) {
        const expression = descendant.getExpression();
        let functionName;
        if (Node.isPropertyAccessExpression(expression)) {
          const ignoreCall = expression.getName();
          if (
            ignoreCall === "map" ||
            ignoreCall === "reduce" ||
            ignoreCall === "sort" ||
            ignoreCall === "filter" ||
            ignoreCall === "slice" ||
            ignoreCall === "charAt" ||
            ignoreCall === "toUpperCase"
          )
            return;
          functionName = expression.getExpression()?.getText();
        } else {
          functionName = expression.getText();
        }

        // Verifica se a chamada está dentro do bloco atual
        if (this.isNodeInBlock(descendant, block)) {
          const isExternal = !this.isFunctionDefinedInSourceFile(
            functionName,
            sourceFile
          );

          if (isExternal) {
            externalDependencies.set(functionName, functionName);
          } else {
            internalDependencies.set(functionName, functionName);
          }
        }
      }
    });

    return {
      block,
      dependencies: {
        internal: Array.from(internalDependencies.values()),
        external: Array.from(externalDependencies.values()),
      },
      referencedBy,
    };
  }

  private isNodeInBlock(node: Node, block: CodeBlock): boolean {
    const nodeLine = node.getStartLineNumber();
    return nodeLine >= block.startLine && nodeLine <= block.endLine;
  }

  private isFunctionDefinedInSourceFile(
    functionName: string,
    sourceFile: SourceFile
  ): boolean {
    return sourceFile
      .getFunctions()
      .some((func) => func.getName() === functionName);
  }
}
