import { Project, Node, SourceFile } from "ts-morph";
import crypto from "crypto";
import path from "node:path";

export async function generateDependencyGraph(projectRootPath: string) {
  const project = new Project({
    tsConfigFilePath: path.join(projectRootPath, "tsconfig.json"),
  });

  const files: {
    path: string;
    imports: any[];
    exports: any[];
    blocks: any[];
  }[] = [];

  project
    .getSourceFiles()
    .filter(
      (sourceFile) =>
        sourceFile.getFilePath().endsWith("src/index.ts") ||
        sourceFile.getFilePath().endsWith("src/workers/installation.ts") ||
        sourceFile.getFilePath().endsWith("src/services/bullmq/index.ts")
    )
    .map((sourceFile) => {
      files.push({
        path: sourceFile.getSourceFile().getFilePath().toString(),
        imports: [],
        exports: [],
        blocks: [],
      });
      const fileIdx = files.length - 1;

      files[fileIdx].imports = getImportDeclarations(sourceFile);
      files[fileIdx].exports = getExportDeclarations(sourceFile);
      files[fileIdx].blocks = getBlocksDeclarations(sourceFile);
    });

  return files;
}

function getImportDeclarations(sourceFile: SourceFile) {
  const imports: {
    name: string;
    alias: string;
    path: string;
    isNamespace: boolean;
    isLib: boolean;
    isDefault: boolean;
  }[] = [];
  sourceFile.getImportDeclarations().map((impDecl) => {
    const isDefault = impDecl.getDefaultImport() !== undefined;
    const isLib =
      (impDecl.getModuleSpecifierSourceFile()?.getFilePath() || "").includes(
        "node_modules"
      ) || false;

    const namespace = impDecl.getNamespaceImport();
    if (namespace) {
      imports.push({
        name: namespace.getText(),
        alias: namespace.getText(),
        path: impDecl.getModuleSpecifierValue(),
        isNamespace: true,
        isLib,
        isDefault,
      });
    } else {
      const named = impDecl.getNamedImports();
      if (named.length > 0) {
        named.map((impNamed) => {
          const alias = impNamed.getAliasNode()?.getText();
          imports.push({
            name: impNamed.getName(),
            alias: alias || impNamed.getName(),
            path: impDecl.getModuleSpecifierSourceFile()?.getFilePath() || "",
            isNamespace: false,
            isLib,
            isDefault,
          });
        });
      } else {
        imports.push({
          name: impDecl.getImportClause()?.getText() || "",
          alias: impDecl.getImportClause()?.getText() || "",
          path: impDecl.getModuleSpecifierValue(),
          isNamespace: false,
          isLib: true,
          isDefault,
        });
      }
    }
  });
  return imports;
}

function getExportDeclarations(sourceFile: SourceFile) {
  const exports: {
    name: string;
    alias: string;
    isNamespace: boolean;
    isDefault: boolean;
  }[] = [];

  for (const [name] of sourceFile.getExportedDeclarations()) {
    exports.push({
      name: name,
      alias: name,
      isDefault: name === "default",
      isNamespace: false,
    });
  }

  // sourceFile.getExportDeclarations().map((expDecl) => {
  //   exports.push({
  //     name: expDecl.getModuleSpecifierValue() || "default",
  //     alias: expDecl.getModuleSpecifierValue() || "default",
  //     isDefault: false,
  //     isNamespace: false,
  //   });
  //   expDecl.getNamedExports().map((namedExp) => {
  //     exports.push({
  //       name: namedExp.getName(),
  //       alias: namedExp.getAliasNode()?.getText() || namedExp.getName(),
  //       isDefault: false,
  //       isNamespace: false,
  //     });
  //   });
  // });

  return exports;
}

// Função para criar um hash de conteúdo (pode ser o código do bloco)
function createHash(content: string): string {
  return crypto.createHash("sha1").update(content).digest("hex");
}

function getBlocksDeclarations(sourceFile: SourceFile) {
  const blocks: {
    hash: string;
    name: string;
    kind: string;
    content: string;
    start: number;
    end: number;
  }[] = [];
  sourceFile.forEachChild((node) => {
    if (
      Node.isFunctionDeclaration(node) ||
      Node.isClassDeclaration(node) ||
      Node.isMethodDeclaration(node) ||
      Node.isInterfaceDeclaration(node) ||
      Node.isTypeAliasDeclaration(node)
    ) {
      blocks.push({
        hash: createHash(node.getText()),
        name: node.getName() || "Anonymous",
        kind: node.getKind().toString(),
        content: node.getText(),
        start: node.getStartLineNumber(),
        end: node.getEndLineNumber(),
      });
    }
  });

  return blocks;
}
