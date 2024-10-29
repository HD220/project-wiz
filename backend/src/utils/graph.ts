import { parse } from "recast";
import { Graph } from "@dagrejs/graphlib";

const code = `
import { foo } from './foo';
function main() {
  foo();
}
main();
`;

const ast = parse(code, {
  parser: import("recast/parsers/typescript"),
});

// Inicializar o grafo
const graph = new Graph();

// Função para adicionar nós e arestas ao grafo
function traverseAST(node, parent = null) {
  recast.types.visit(node, {
    visitImportDeclaration(path) {
      const importName = path.node.source.value;
      const currentNode = path.node;
      graph.setNode(importName); // Adiciona o nó de importação
      if (parent) {
        graph.setEdge(parent, importName); // Adiciona a aresta de dependência
      }
      this.traverse(path);
    },
    visitFunctionDeclaration(path) {
      const functionName = path.node.id.name;
      graph.setNode(functionName); // Adiciona o nó de função
      if (parent) {
        graph.setEdge(parent, functionName);
      }
      traverseAST(path.node.body, functionName); // Recursão para o corpo da função
      return false;
    },
    visitCallExpression(path) {
      const callee = path.node.callee.name;
      graph.setNode(callee);
      if (parent) {
        graph.setEdge(parent, callee);
      }
      this.traverse(path);
    },
  });
}

// Percorre o AST e constrói o grafo
traverseAST(ast);

// 3. Identificar os Componentes usando `tarjan` ou `components`
const components = graphlib.alg.components(graph); // encontra os componentes fortemente conectados
components.forEach((component, i) => {
  console.log(`Componente ${i + 1}:`, component);
});
