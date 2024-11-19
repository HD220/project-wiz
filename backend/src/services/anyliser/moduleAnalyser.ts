import { generateModuleName } from "@/utils/generateModuleName";
import { Graph } from "@dagrejs/graphlib";
import path from "path";

export type FileNode = {
  path: string;
  imports: string[];
  //   exports: string[];
  //   content: string;
  description: string;
};

export type ModuleGroup = {
  files: string[];
  name: string;
  //   description: string;
  cohesion: number;
  coupling: number;
  centralFile?: string;
};

export class ModuleAnalyzer {
  private graph: Graph;

  constructor() {
    this.graph = new Graph({ directed: true, compound: true });
  }

  analyzeModules(files: FileNode[]): ModuleGroup[] {
    // 1. Construir o grafo de dependências
    this.buildDependencyGraph(files);

    // 2. Calcular pesos das arestas baseado em diferentes métricas
    this.calculateEdgeWeights();

    // 3. Detectar comunidades usando algoritmo de Louvain
    const communities = this.detectCommunities();

    // 4. Refinar grupos baseado em métricas de coesão
    return this.refineGroups(communities);
  }

  private buildDependencyGraph(files: FileNode[]) {
    // Adicionar nós
    files.forEach((file) => {
      // console.log("add node", file.path);
      this.graph.setNode(file.path, file);
    });

    // Adicionar arestas baseadas em imports/exports
    files.forEach((file) => {
      file.imports.forEach((imp) => {
        // console.log("add edge", imp, "from", file.path);
        if (this.graph.hasNode(imp)) {
          this.graph.setEdge(file.path, imp, { weigth: 1 });
        }
      });
    });
  }

  private calculateEdgeWeights() {
    this.graph.edges().forEach((e) => {
      const source = this.graph.node(e.v) as FileNode;
      const target = this.graph.node(e.w) as FileNode;
      const weight = this.calculateEdgeWeight(source, target);
      this.graph.setEdge(e.v, e.w, { weight });
    });
  }

  private calculateEdgeWeight(source: FileNode, target: FileNode): number {
    let weight = 1;

    // 1. Peso baseado em coesão entre os arquivos
    const sharedNeighbors = this.calculateSharedNeighbors(
      source.path,
      target.path
    );
    weight += sharedNeighbors;

    // 2. Peso baseado em acoplamento (número de conexões externas)
    const sourceDegree = this.graph.neighbors(source.path)?.length || 0;
    const targetDegree = this.graph.neighbors(target.path)?.length || 0;
    weight += 1 / (sourceDegree + targetDegree + 1); // Penaliza arquivos com muitas conexões externas

    // 3. Similaridade de caminho
    weight += this.calculatePathSimilarity(source.path, target.path);

    return weight;
  }

  private calculateSharedNeighbors(path1: string, path2: string): number {
    const neighbors1 = new Set(this.graph.neighbors(path1) || []);
    const neighbors2 = new Set(this.graph.neighbors(path2) || []);
    const shared = [...neighbors1].filter((n) => neighbors2.has(n));
    return shared.length;
  }

  private calculatePathSimilarity(path1: string, path2: string): number {
    const segments1 = path1.split("\\");
    const segments2 = path2.split("\\");
    const commonSegments = segments1.filter(
      (seg, idx) => seg === segments2[idx]
    );
    return commonSegments.length / Math.max(segments1.length, segments2.length);
  }

  private detectCommunities(): ModuleGroup[] {
    const communities: ModuleGroup[] = [];
    const visited = new Set<string>();

    // Ordenar nós pelo peso acumulado das arestas
    const nodesSortedByEdgeWeight = this.graph
      .nodes()
      .sort(
        (a, b) => this.calculateNodeWeight(b) - this.calculateNodeWeight(a)
      );

    nodesSortedByEdgeWeight.forEach((node) => {
      if (!visited.has(node)) {
        const currentCommunity = this.collectCommunity(node, visited);

        const cohesion = this.calculateGroupCohesion(currentCommunity);
        const coupling = this.calculateGroupCoupling(currentCommunity);

        communities.push({
          files: currentCommunity,
          name: "",
          cohesion,
          coupling,
          centralFile: this.findCentralFile(currentCommunity),
        });
      }
    });

    return communities;
  }

  private calculateNodeWeight(node: string): number {
    const neighbors = this.graph.neighbors(node) || [];
    return neighbors.reduce((sum, neighbor) => {
      const edge = this.graph.edge(node, neighbor) as { weight: number };
      return sum + (edge?.weight || 0);
    }, 0);
  }

  // private louvainCommunityDetection(): ModuleGroup[] {
  //   const communities: ModuleGroup[] = [];
  //   const visited = new Set<string>();

  //   this.graph.nodes().forEach((node) => {
  //     if (!visited.has(node)) {
  //       const currentCommunity = this.collectCommunity(node, visited);

  //       const cohesion = this.calculateGroupCohesion(currentCommunity);
  //       const coupling = this.calculateGroupCoupling(currentCommunity);

  //       console.log(node, cohesion, coupling);

  //       communities.push({
  //         files: currentCommunity,
  //         name: "",
  //         cohesion,
  //         coupling,
  //         centralFile: this.findCentralFile(currentCommunity),
  //       });
  //     }
  //   });

  //   return communities;
  // }

  private collectCommunity(node: string, visited: Set<string>): string[] {
    const community: string[] = [];
    const stack = [node];

    while (stack.length) {
      const current = stack.pop()!;
      if (!visited.has(current)) {
        visited.add(current);
        community.push(current);

        // Obter vizinhos ordenados pelo peso das arestas
        const neighbors = (this.graph.neighbors(current) || [])
          .filter((n) => !visited.has(n))
          .sort((a, b) => {
            const edgeA = this.graph.edge(current, a) as { weight: number };
            const edgeB = this.graph.edge(current, b) as { weight: number };
            return (edgeB?.weight || 0) - (edgeA?.weight || 0);
          });

        stack.push(...neighbors);
      }
    }

    return community;
  }

  private calculateGroupCohesion(files: string[]): number {
    let internalEdges = 0;
    const possibleEdges = files.length * (files.length - 1);

    files.forEach((file1) => {
      files.forEach((file2) => {
        if (file1 !== file2 && this.graph.hasEdge(file1, file2)) {
          internalEdges++;
        }
      });
    });

    return possibleEdges > 0 ? internalEdges / possibleEdges : 0;
  }

  private calculateGroupCoupling(files: string[]): number {
    let externalEdges = 0;
    const fileSet = new Set(files);

    files.forEach((file) => {
      const neighbors = this.graph.neighbors(file) || [];

      neighbors.forEach((neighbor) => {
        if (!fileSet.has(neighbor)) {
          externalEdges++;
        }
      });
    });

    return externalEdges / files.length;
  }

  private findCentralFile(files: string[]): string {
    let maxDegree = -1;
    let centralFile = files[0];

    files.forEach((file) => {
      const degree = (this.graph.neighbors(file) || []).length;
      if (degree > maxDegree) {
        maxDegree = degree;
        centralFile = file;
      }
    });

    return centralFile;
  }

  private refineGroups(initialGroups: ModuleGroup[]): ModuleGroup[] {
    // 1. Mesclar grupos muito pequenos
    const groups = this.mergeSmallGroups(initialGroups);

    // 2. Dividir grupos muito grandes
    // groups = this.splitLargeGroups(groups);

    // 3. Otimizar baseado em métricas
    // groups = this.optimizeGroups(groups);

    return groups.map((group) => {
      // console.log("group:", group.centralFile, "width", group.files.length);
      console.log(
        "group_names",
        group.files.map((file) => this.graph.node(file).description)
      );

      return {
        ...group,
        name: generateModuleName(
          group.files.map((file) => this.graph.node(file).description)
        ),
      };
    });
  }

  private mergeSmallGroups(groups: ModuleGroup[]): ModuleGroup[] {
    const MIN_GROUP_SIZE = 3;
    const result: ModuleGroup[] = [];

    // Ordenar grupos por tamanho
    const sortedGroups = groups.sort((a, b) => a.files.length - b.files.length);

    for (const group of sortedGroups) {
      if (group.files.length < MIN_GROUP_SIZE) {
        // Encontrar melhor grupo para mesclar
        const bestMatch = this.findBestGroupToMerge(group, result);
        if (bestMatch) {
          bestMatch.files.push(...group.files);
          bestMatch.cohesion = this.calculateGroupCohesion(bestMatch.files);
          bestMatch.coupling = this.calculateGroupCoupling(bestMatch.files);
        } else {
          result.push(group);
        }
      } else {
        result.push(group);
      }
    }

    return result;
  }

  private findBestGroupToMerge(
    group: ModuleGroup,
    existingGroups: ModuleGroup[]
  ): ModuleGroup | null {
    let bestScore = -1;
    let bestGroup: ModuleGroup | null = null;

    for (const existing of existingGroups) {
      const score = this.calculateMergeScore(group, existing);
      if (score > bestScore) {
        bestScore = score;
        bestGroup = existing;
      }
    }

    return bestGroup;
  }

  private calculateMergeScore(
    group1: ModuleGroup,
    group2: ModuleGroup
  ): number {
    // Combinar arquivos temporariamente
    const combinedFiles = [...group1.files, ...group2.files];

    // Calcular métricas do grupo combinado
    const cohesion = this.calculateGroupCohesion(combinedFiles);
    const coupling = this.calculateGroupCoupling(combinedFiles);

    // Score baseado em coesão alta e acoplamento baixo
    return cohesion - coupling;
  }
}
