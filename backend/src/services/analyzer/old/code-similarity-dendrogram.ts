import * as tf from 'tfidf';
import * as natural from 'natural';
import * as numeric from 'numeric';
import * as jstat from 'jstat';
import * as d3 from 'd3';

interface CodeBlock {
  id: string;
  content: string;
  keywords: string[];
}

class SimilarityDendrogramAnalyzer {
  private codeBlocks: CodeBlock[];
  private similarityMatrix: number[][];
  private distanceMetrics = {
    euclidean: (a: number[], b: number[]) => 
      Math.sqrt(a.map((x, i) => Math.pow(x - b[i], 2)).reduce((sum, val) => sum + val, 0)),
    cosine: (a: number[], b: number[]) => {
      const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
      const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
      const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
      return 1 - (dotProduct / (magnitudeA * magnitudeB));
    },
    wardDistance: (cluster1: number[][], cluster2: number[][]) => {
      const centroid1 = this.calculateCentroid(cluster1);
      const centroid2 = this.calculateCentroid(cluster2);
      return this.euclideanDistance(centroid1, centroid2);
    }
  };

  constructor(codeBlocks: CodeBlock[]) {
    this.codeBlocks = codeBlocks;
    this.similarityMatrix = [];
  }

  private extractEmbeddings(keywords: string[]): number[] {
    // Simple embedding strategy - you might want to replace with more sophisticated embedding
    const embeddingDimension = 50;
    return keywords.map((keyword, index) => 
      this.simpleHashEmbedding(keyword, embeddingDimension)
    ).reduce((acc, embedding) => 
      acc.map((val, i) => val + embedding[i]), 
      new Array(embeddingDimension).fill(0)
    ).map(val => val / keywords.length);
  }

  private simpleHashEmbedding(keyword: string, dimension: number): number[] {
    let hash = 0;
    for (let i = 0; i < keyword.length; i++) {
      hash = ((hash << 5) - hash) + keyword.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Array.from({length: dimension}, (_, i) => 
      Math.sin(hash * (i + 1)) // Deterministic but pseudo-random projection
    );
  }

  private calculateSimilarityMatrix() {
    const embeddings = this.codeBlocks.map(block => 
      this.extractEmbeddings(block.keywords)
    );

    this.similarityMatrix = embeddings.map((embedding1, i) => 
      embeddings.map((embedding2, j) => 
        j <= i 
          ? (j === i ? 0 : this.distanceMetrics.cosine(embedding1, embedding2)) 
          : 0
      )
    );

    // Make matrix symmetric
    this.similarityMatrix = this.similarityMatrix.map((row, i) => 
      row.map((val, j) => 
        val === 0 && i !== j ? this.similarityMatrix[j][i] : val
      )
    );
  }

  private performHierarchicalClustering(
    distanceMatrix: number[][], 
    linkageMethod: 'single' | 'complete' | 'average' | 'ward' = 'ward'
  ) {
    const n = distanceMatrix.length;
    const clusters = Array.from({length: n}, (_, i) => [i]);
    const clusterDistances = distanceMatrix.map(row => [...row]);
    const dendrogramLinks = [];

    while (clusters.length > 1) {
      let minDistance = Infinity;
      let minI = 0, minJ = 0;

      for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
          const distance = this.calculateInterClusterDistance(
            clusters[i], 
            clusters[j], 
            clusterDistances, 
            linkageMethod
          );

          if (distance < minDistance) {
            minDistance = distance;
            minI = i;
            minJ = j;
          }
        }
      }

      const newCluster = [...clusters[minI], ...clusters[minJ]];
      dendrogramLinks.push({
        clusters: [clusters[minI], clusters[minJ]],
        distance: minDistance
      });

      clusters.splice(minI, 1);
      clusters.splice(minJ > minI ? minJ - 1 : minJ, 1);
      clusters.push(newCluster);
    }

    return dendrogramLinks;
  }

  private calculateInterClusterDistance(
    cluster1: number[], 
    cluster2: number[], 
    distanceMatrix: number[][], 
    method: string
  ): number {
    switch(method) {
      case 'single':
        return Math.min(...cluster1.flatMap(i => 
          cluster2.map(j => distanceMatrix[i][j])
        ));
      case 'complete':
        return Math.max(...cluster1.flatMap(i => 
          cluster2.map(j => distanceMatrix[i][j])
        ));
      case 'average':
        return cluster1.flatMap(i => 
          cluster2.map(j => distanceMatrix[i][j])
        ).reduce((a, b) => a + b, 0) / (cluster1.length * cluster2.length);
      case 'ward':
        // Ward's method minimizes variance
        const allPoints = [...cluster1, ...cluster2];
        const centroid = this.calculateClusterCentroid(allPoints, distanceMatrix);
        return allPoints.reduce((sum, point) => 
          sum + Math.pow(this.euclideanDistance(
            this.getPointCoordinates(point, distanceMatrix), 
            centroid
          ), 2), 0);
      default:
        throw new Error('Invalid linkage method');
    }
  }

  private getPointCoordinates(pointIndex: number, distanceMatrix: number[][]): number[] {
    return [pointIndex];  // Simplified for this example
  }

  private calculateClusterCentroid(cluster: number[], distanceMatrix: number[][]): number[] {
    // Simplified centroid calculation
    return [cluster.reduce((a, b) => a + b, 0) / cluster.length];
  }

  private euclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(a.map((x, i) => Math.pow(x - b[i], 2)).reduce((sum, val) => sum + val, 0));
  }

  public analyzeSimilarities() {
    this.calculateSimilarityMatrix();
    const dendrogramStructure = this.performHierarchicalClustering(
      this.similarityMatrix, 
      'ward'
    );

    return {
      similarityMatrix: this.similarityMatrix,
      dendrogram: dendrogramStructure,
      blocks: this.codeBlocks
    };
  }

  public visualizeDendrogram(analysisResult: ReturnType<typeof this.analyzeSimilarities>) {
    // D3.js based dendrogram visualization 
    const svg = d3.select('body').append('svg')
      .attr('width', 800)
      .attr('height', 600);

    const root = d3.hierarchy(analysisResult.dendrogram);
    const dendrogramLayout = d3.cluster().size([600, 700]);
    dendrogramLayout(root);

    // Rendering logic would go here, creating lines and labels
    // This is a placeholder for actual D3 rendering
    console.log('Dendrogram visualization would be created here');
  }
}

// Exemplo de uso
const codeBlocks: CodeBlock[] = [
  { 
    id: 'user-create', 
    content: 'function createUser() { ... }', 
    keywords: ['user', 'create', 'authentication'] 
  },
  { 
    id: 'user-update', 
    content: 'function updateUser() { ... }', 
    keywords: ['user', 'update', 'profile'] 
  },
  { 
    id: 'product-create', 
    content: 'function createProduct() { ... }', 
    keywords: ['product', 'create', 'inventory'] 
  }
];

const analyzer = new SimilarityDendrogramAnalyzer(codeBlocks);
const result = analyzer.analyzeSimilarities();
console.log('Similarity Analysis:', result);
