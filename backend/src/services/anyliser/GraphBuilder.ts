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

  constructor(files: FileNode[]) {
    this.graph = new graphlib.Graph({ directed: true });
    this.buildGraph(files);
    this.discoveryGroups();
  }

  private buildGraph(files: FileNode[]) {
    files.forEach((file) => {
      this.graph.setNode(file.path, file);
    });
    //relacação baseada nos imports
    files.forEach((file) => {
      file.imports.forEach((imp) => {
        if (this.graph.hasNode(imp)) {
          this.graph.setEdge(file.path, imp);
        }
      });
    });

    //   this.graph.edges().forEach((edge) => {
    //     const nodeV = this.graph.node(edge.v)
    //     const nodew = this.graph.node(edge.w)

    //     const weight = 0

    //     this.graph.setEdge(edge.v, edge.w, {weight})

    //   });
  }

  private discoveryGroups() {
    const dijkstra = graphlib.alg.floydWarshall(this.graph);
    console.log("dijkstra", dijkstra);
  }
}
