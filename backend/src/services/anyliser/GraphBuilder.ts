import * as graphlib from "@dagrejs/graphlib";

export type FileNode = {
  path: string;
  imports: string[];
  tokens: string[]; //nome de todos tokens encontrados no arquivo
};

export type ModuleGroup = {
  name: string;
  files: string[];
  centralFile?: string;
  cohesion: number;
  coupling: number;
};

export class GraphBuilder {
  private graph: graphlib.Graph;

  constructor(files: FileNode[]) {
    this.graph = new graphlib.Graph({ directed: true });
    this.buildGraph(files);
    this.calculateCohesionAndCoupling();
    console.log("modules", this.identifyClusters(0.5, 0.5));
  }

  private buildGraph(files: FileNode[]) {
    files.forEach((file) => {
      this.graph.setNode(file.path);
    });
    //relacação baseada nos imports
    files.forEach((file) => {
      file.imports.forEach((imp) => {
        if (this.graph.hasNode(imp)) {
          this.graph.setEdge(file.path, imp, { cohesion: 0, coupling: 0 });
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

  private calculateCohesionAndCoupling(): void {
    this.graph.edges().forEach((edge) => {
      const source = edge.v as string;
      const target = edge.w as string;

      let internalEdges = 0;
      let externalEdges = 0;

      const sourceNeighbors = this.graph.successors(source) || [];
      const targetNeighbors = this.graph.successors(target) || [];

      sourceNeighbors.forEach((neighbor) => {
        if (neighbor === target || this.graph.hasEdge(neighbor, target)) {
          internalEdges++;
        } else {
          externalEdges++;
        }
      });

      targetNeighbors.forEach((neighbor) => {
        if (neighbor === source || this.graph.hasEdge(neighbor, source)) {
          internalEdges++;
        } else {
          externalEdges++;
        }
      });

      const totalEdges = internalEdges + externalEdges;
      const cohesion = totalEdges === 0 ? 0 : internalEdges / totalEdges;
      const coupling = totalEdges === 0 ? 0 : externalEdges / totalEdges;

      this.graph.edge(edge).cohesion = cohesion;
      this.graph.edge(edge).coupling = coupling;
    });
  }

  public identifyClusters(
    thresholdCohesion: number,
    thresholdCoupling: number
  ): ModuleGroup[] {
    const clusters: ModuleGroup[] = [];
    const visitedNodes: Set<string> = new Set();

    this.graph.nodes().forEach((node) => {
      if (!visitedNodes.has(node)) {
        const cluster: ModuleGroup = {
          files: [],
          name: `Cluster ${clusters.length + 1}`,
          cohesion: 0,
          coupling: 0,
        };

        this.exploreCluster(
          node,
          cluster,
          visitedNodes,
          thresholdCohesion,
          thresholdCoupling
        );
        clusters.push(cluster);
      }
    });

    return clusters;
  }

  private exploreCluster(
    node: string,
    cluster: ModuleGroup,
    visitedNodes: Set<string>,
    thresholdCohesion: number,
    thresholdCoupling: number
  ): void {
    cluster.files.push(node);
    visitedNodes.add(node);

    const neighbors = this.graph.successors(node) || [];

    neighbors.forEach((neighbor) => {
      if (!visitedNodes.has(neighbor)) {
        const edge = this.graph.edge(node, neighbor);
        if (
          edge.cohesion >= thresholdCohesion &&
          edge.coupling <= thresholdCoupling
        ) {
          cluster.cohesion += edge.cohesion;
          cluster.coupling += edge.coupling;

          this.exploreCluster(
            neighbor,
            cluster,
            visitedNodes,
            thresholdCohesion,
            thresholdCoupling
          );
        }
      }
    });
  }
}
