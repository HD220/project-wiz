import * as graphlib from "@dagrejs/graphlib";

export type FileNode = {
  path: string;
  imports: string[];
  tokens: string[]; //nome de todos tokens encontrados no arquivo
};

export type ModuleGroup = {
  files: string[];
  name: string;
  cohesion: number;
  coupling: number;
  centralFile?: string;
};

export class GraphBuilder {
  private graph: graphlib.Graph;
  private nodeScores: Map<string, number>;

  constructor(files: FileNode[]) {
    this.graph = new graphlib.Graph({ directed: true });
    this.nodeScores = new Map();
    this.buildGraph(files);
    // this.discoveryGroups();
    this.calculateNodeScores();
    console.log("nodeScores", this.nodeScores);
  }

  private buildGraph(files: FileNode[]) {
    files.forEach((file) => {
      this.graph.setNode(file.path);
    });
    //relacação baseada nos imports
    files.forEach((file) => {
      file.imports.forEach((imp) => {
        if (this.graph.hasNode(imp)) {
          this.graph.setEdge(file.path, imp);
        }
      });
    });

    this.graph.nodes().forEach((node) => {
      const predecessor = this.graph.predecessors(node) || [];
      // const predecessor = this.graph.successors(node)||[]
      this.graph.setNode(node, { weight: predecessor.length });

      console.log(node, predecessor.length);
    });
  }

  private calculateNodeScores(): void {
    // Ordenação topológica para garantir que os predecessores sejam visitados antes
    const nodes = this.graph.nodes();
    const sortedNodes = this.topologicalSort(nodes);

    // Inicializar pontuações
    sortedNodes.forEach((node) => this.nodeScores.set(node, 0));

    // Calcular pontuações
    sortedNodes.forEach((node) => {
      const predecessors = this.graph.predecessors(node) || [];
      const score = predecessors.reduce(
        (sum, pred) => sum + (this.nodeScores.get(pred) || 0) + 1,
        0
      );
      this.nodeScores.set(node, score);
    });
  }

  private topologicalSort(nodes: string[]): string[] {
    const visited = new Set<string>();
    const stack: string[] = [];

    const visit = (node: string) => {
      if (!visited.has(node)) {
        visited.add(node);
        const neighbors = this.graph.successors(node) || [];
        neighbors.forEach(visit);
        stack.push(node);
      }
    };

    nodes.forEach(visit);
    return stack.reverse();
  }

  private discoveryGroups() {
    const dijkstra = graphlib.alg.floydWarshall(this.graph);
    console.log(
      "dijkstra",
      Object.entries(dijkstra).map(([node, path]) => ({
        node,
        targets: Object.entries(path)
          .filter(
            ([, path]) => path.distance !== Infinity && path.distance !== 0
          )
          .map(([dest, path]) =>
            JSON.stringify({ dest: dest, distance: path.distance })
          ),
      }))
    );
  }
}
