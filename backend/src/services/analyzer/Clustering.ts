// Definição de tipos
interface Term {
  value: string;
  vector: number[];
  tfIdf: number;
}

interface Cluster {
  centerTerm: string;
  terms: string[];
  vector: number[];
  radius: number;
  depth: number;
  score: number;
}

class VectorUtils {
  static calculateDistance(vectorA: number[], vectorB: number[]): number {
    return Math.sqrt(
      vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0)
    );
  }

  static calculateMeanVector(vectors: number[][]): number[] {
    if (vectors.length === 0) return [];

    return vectors[0].map(
      (_, i) => vectors.reduce((sum, vec) => sum + vec[i], 0) / vectors.length
    );
  }
}

class CooccurrenceMatrixProcessor {
  static createCooccurrenceMatrix(documents: string[][]): number[][] {
    const terms = Array.from(new Set(documents.flat()));
    const termIndex = new Map(terms.map((term, index) => [term, index]));
    const matrix = Array(terms.length)
      .fill(0)
      .map(() => Array(terms.length).fill(0));

    documents.forEach((doc) => {
      for (let i = 0; i < doc.length; i++) {
        for (let j = 0; j < doc.length; j++) {
          const row = termIndex.get(doc[i])!;
          const col = termIndex.get(doc[j])!;
          matrix[row][col]++;
        }
      }
    });

    return matrix;
  }

  static createProbabilityMatrix(matrix: number[][]): number[][] {
    const rowSums = matrix.map((row) => row.reduce((sum, val) => sum + val, 0));
    return matrix.map((row, i) =>
      row.map((value) => (rowSums[i] > 0 ? value / rowSums[i] : 0))
    );
  }

  static reorderMatrixByCooccurrence(matrix: number[][]): number[][] {
    const rowSums = matrix.map((row) => row.reduce((sum, val) => sum + val, 0));
    const order = rowSums
      .map((sum, index) => ({ sum, index }))
      .sort((a, b) => b.sum - a.sum)
      .map((entry) => entry.index);

    return order.map((i) => order.map((j) => matrix[i][j]));
  }

  static reduceMatrixTo3x3(matrix: number[][]): number[][] {
    const numRows = matrix.length;
    const numCols = matrix[0].length;

    const blockSizeRow = Math.ceil(numRows / 3);
    const blockSizeCol = Math.ceil(numCols / 3);

    const reducedMatrix = Array(3)
      .fill(0)
      .map(() => Array(3).fill(0));

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let sum = 0,
          count = 0;

        for (
          let row = i * blockSizeRow;
          row < Math.min((i + 1) * blockSizeRow, numRows);
          row++
        ) {
          for (
            let col = j * blockSizeCol;
            col < Math.min((j + 1) * blockSizeCol, numCols);
            col++
          ) {
            sum += matrix[row][col];
            count++;
          }
        }

        reducedMatrix[i][j] = count > 0 ? sum / count : 0;
      }
    }

    return reducedMatrix;
  }
}

class ClusterExpander {
  static expandCluster(
    cluster: Cluster,
    terms: Term[],
    maxExpansion: number = 5
  ): Cluster {
    const expansionCandidates = terms
      .filter((term) => !cluster.terms.includes(term.value))
      .map((term) => ({
        term,
        distance: VectorUtils.calculateDistance(cluster.vector, term.vector),
      }))
      .filter(
        (candidate) =>
          candidate.distance <= cluster.radius && candidate.term.tfIdf > 0.1
      )
      .sort((a, b) => a.distance - b.distance);

    const newTerms = expansionCandidates
      .slice(0, maxExpansion)
      .map((candidate) => candidate.term.value);

    const updatedTerms = [...new Set([...cluster.terms, ...newTerms])];

    const updatedVectors = terms
      .filter((term) => updatedTerms.includes(term.value))
      .map((term) => term.vector);

    const updatedVector = VectorUtils.calculateMeanVector(updatedVectors);

    return {
      centerTerm: cluster.centerTerm,
      terms: updatedTerms,
      vector: updatedVector,
      radius: ClusterExpander.recalculateRadius(cluster, updatedVectors),
      depth: cluster.depth + 1,
      score: ClusterExpander.recalculateScore(cluster, newTerms, terms),
    };
  }

  private static recalculateRadius(
    cluster: Cluster,
    vectors: number[][]
  ): number {
    if (vectors.length === 0) return cluster.radius;

    const meanVector = VectorUtils.calculateMeanVector(vectors);
    const distances = vectors.map((vec) =>
      VectorUtils.calculateDistance(meanVector, vec)
    );

    return (
      (distances.reduce((sum, dist) => sum + dist, 0) / distances.length) *
      (1 + cluster.depth * 0.1)
    );
  }

  private static recalculateScore(
    cluster: Cluster,
    newTerms: string[],
    allTerms: Term[]
  ): number {
    const newTermsTfIdf = newTerms
      .map((term) => allTerms.find((t) => t.value === term)!.tfIdf)
      .reduce((sum, tfidf) => sum + tfidf, 0);

    return cluster.score + newTermsTfIdf / newTerms.length;
  }
}

class HierarchicalClusterExtractor {
  private terms: Term[];

  constructor(terms: Term[]) {
    this.terms = terms;
  }

  generateInitialClusters(): Cluster[] {
    return this.terms.map((term) => ({
      centerTerm: term.value,
      terms: [term.value],
      vector: term.vector,
      radius: term.tfIdf * 0.5,
      depth: 0,
      score: term.tfIdf,
    }));
  }

  removeDuplicateClusters(clusters: Cluster[]): Cluster[] {
    return clusters.filter(
      (cluster, index) =>
        !clusters.some(
          (otherCluster, otherIndex) =>
            index !== otherIndex && this.isSubsetCluster(cluster, otherCluster)
        )
    );
  }

  private isSubsetCluster(
    subsetCandidate: Cluster,
    supersetCluster: Cluster
  ): boolean {
    const subsetTerms = new Set(subsetCandidate.terms);
    const supersetTerms = new Set(supersetCluster.terms);

    return (
      [...subsetTerms].every((term) => supersetTerms.has(term)) &&
      subsetCandidate.terms.length < supersetCluster.terms.length
    );
  }

  orderClustersByAbstractness(clusters: Cluster[]): Cluster[] {
    return clusters.sort((a, b) => {
      const specificityA = a.score / a.terms.length;
      const specificityB = b.score / b.terms.length;
      return specificityB - specificityA;
    });
  }

  extractHierarchicalClusters(
    maxIterations: number = 3,
    maxClusters: number = 20
  ): Cluster[] {
    let clusters = this.generateInitialClusters();

    for (let i = 0; i < maxIterations; i++) {
      clusters = clusters.map((cluster) =>
        ClusterExpander.expandCluster(cluster, this.terms)
      );

      if (clusters.length > maxClusters) {
        clusters = clusters.slice(0, maxClusters);
      }
    }

    clusters = this.removeDuplicateClusters(clusters);
    return this.orderClustersByAbstractness(clusters);
  }
}

// Função principal para extrair módulos
function extractModulesFromTerms(
  documents: string[][],
  terms: Term[]
): Cluster[] {
  const cooccurrenceMatrix =
    CooccurrenceMatrixProcessor.createCooccurrenceMatrix(documents);
  const probabilityMatrix =
    CooccurrenceMatrixProcessor.createProbabilityMatrix(cooccurrenceMatrix);
  const reorderedMatrix =
    CooccurrenceMatrixProcessor.reorderMatrixByCooccurrence(probabilityMatrix);
  const reducedMatrix =
    CooccurrenceMatrixProcessor.reduceMatrixTo3x3(reorderedMatrix);

  const extractor = new HierarchicalClusterExtractor(terms);
  return extractor.extractHierarchicalClusters();
}

export {
  CooccurrenceMatrixProcessor,
  HierarchicalClusterExtractor,
  extractModulesFromTerms,
};
