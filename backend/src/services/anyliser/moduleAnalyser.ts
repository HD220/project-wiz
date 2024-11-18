import { Graph } from "@dagrejs/graphlib";

export type FileNode = {
  path: string;
  imports: string[];
  //   exports: string[];
  //   content: string;
  description: string;
};

export type ModuleGroup = {
  files: string[];
  //   name: string,
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
      this.graph.setNode(file.path, file);
    });

    // Adicionar arestas baseadas em imports/exports
    files.forEach((file) => {
      file.imports.forEach((imp) => {
        if (this.graph.hasNode(imp)) {
          this.graph.setEdge(file.path, imp);
        }
      });
    });
  }

  private calculateEdgeWeights() {
    this.graph.edges().forEach((e) => {
      const weight = this.calculateEdgeWeight(
        this.graph.node(e.v),
        this.graph.node(e.w)
      );
      this.graph.setEdge(e.v, e.w, { weight });
    });
  }

  private calculateEdgeWeight(source: FileNode, target: FileNode): number {
    let weight = 0;

    // 1. Peso baseado em imports diretos
    weight += 1;

    // 2. Peso baseado em similaridade de conteúdo
    weight += this.calculateContentSimilarity(source, target);

    // 3. Peso baseado em padrões de nome/caminho
    weight += this.calculatePathSimilarity(source.path, target.path);

    // 4. Peso baseado em similaridade semântica das descrições
    weight += this.calculateDescriptionSimilarity(
      source.description,
      target.description
    );

    return weight;
  }

  private calculateContentSimilarity(file1: FileNode, file2: FileNode): number {
    // Implementar similaridade usando TF-IDF ou outra métrica
    return 0;
  }

  private calculatePathSimilarity(path1: string, path2: string): number {
    const segments1 = path1.split("/");
    const segments2 = path2.split("/");
    const commonSegments =
      segments1.length >= segments2.length
        ? segments1.reduce((acc, cur, idx) => {
            if (segments2[idx] !== undefined) return acc + 1;
            return acc;
          }, 0)
        : segments2.reduce((acc, cur, idx) => {
            if (segments1[idx] !== undefined) return acc + 1;
            return acc;
          }, 0);
    return commonSegments / Math.max(segments1.length, segments2.length);
  }

  private calculateDescriptionSimilarity(desc1: string, desc2: string): number {
    // Implementar similaridade semântica usando embeddings ou outra técnica
    return 0;
  }

  private detectCommunities(): ModuleGroup[] {
    return this.louvainCommunityDetection();
  }

  private louvainCommunityDetection(): ModuleGroup[] {
    const communities: ModuleGroup[] = [];
    const nodes = this.graph.nodes();
    let currentCommunity: string[] = [];

    // Implementação simplificada do algoritmo de Louvain
    const visited = new Set<string>();

    const processNode = (node: string) => {
      if (visited.has(node)) return;

      visited.add(node);
      currentCommunity.push(node);

      // Encontrar vizinhos com maior modularity
      const neighbors = this.graph.neighbors(node);
      if (!neighbors) return;

      neighbors
        .filter((n) => !visited.has(n))
        .sort((a, b) => {
          const weightA = this.graph.edge(node, a)?.weight || 0;
          const weightB = this.graph.edge(node, b)?.weight || 0;
          return weightB - weightA;
        })
        .forEach(processNode);
    };

    // Processar cada nó não visitado
    nodes.forEach((node) => {
      if (!visited.has(node)) {
        currentCommunity = [];
        processNode(node);

        if (currentCommunity.length > 0) {
          communities.push({
            files: currentCommunity,
            cohesion: this.calculateGroupCohesion(currentCommunity),
            coupling: this.calculateGroupCoupling(currentCommunity),
            centralFile: this.findCentralFile(currentCommunity),
          });
        }
      }
    });

    return communities;
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

    return groups;
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
