import { SourceMapConsumer } from "source-map";
import { print, parse, visit, types } from "recast";

export async function generateSourceMap(code: string, fileName: string) {
  const ast = parse(code, {
    sourceFileName: fileName,
    parser: await import("recast/parsers/typescript"),
  });
  const sourceMap = print(ast, {
    sourceMapName: `${fileName.split(".")[0]}.min.js`,
  });

  const imports = new Map<string, string[]>();
  visit(ast, {
    visitImportDeclaration(path) {
      const pathImported = path.node.source.value?.toString() || "";
      // Obtém os nomes importados
      const specifiers =
        path.node.specifiers
          ?.map((specifier) => {
            if (types.namedTypes.ImportSpecifier.check(specifier)) {
              return specifier.imported.name.toString() || ""; // Para importações nomeadas
            } else if (
              types.namedTypes.ImportDefaultSpecifier.check(specifier)
            ) {
              return specifier.local?.name.toString() || ""; // Para a importação padrão
            }
            return "";
          })
          .filter(Boolean) || []; // Filtra valores nulos

      const old = imports.get(pathImported) || [];
      imports.set(pathImported, [...old, ...specifiers]);

      return this.traverse(path);
    },
  });

  return {
    sourceMap: sourceMap.map,
    imports: Object.entries(imports)
      .map(([path, imports]) => ({
        path,
        imports,
      }))
      .reduce((acc, cur) => ({ ...acc, [cur.path]: cur.imports }), {}),
  };
}

export function generateRepositorySourceMap() {}
