interface SourceDocument {
  id: string;
  keywords: string[];
}

export class ModuleIdentifier {
  // Find frequently associated keywords to suggest potential modules
  identifyKeywordAssociations(docs: SourceDocument[], minSupport = 0.05) {
    const cooccurrenceMap: Map<string, Set<string>> = new Map();

    docs.forEach((doc) => {
      for (let i = 0; i < doc.keywords.length; i++) {
        for (let j = i + 1; j < doc.keywords.length; j++) {
          const sortedPairKey = [doc.keywords[i], doc.keywords[j]]
            .sort()
            .join("|");
          if (!cooccurrenceMap.has(sortedPairKey)) {
            cooccurrenceMap.set(sortedPairKey, new Set());
          }
          cooccurrenceMap.get(sortedPairKey)!.add(doc.id);
        }
      }
    });

    return Array.from(cooccurrenceMap.entries())
      .map(([pair, docSet]) => ({
        keywords: pair.split("|"),
        support: docSet.size / docs.length,
        documents: Array.from(docSet),
      }))
      .filter((item) => item.support >= minSupport)
      .sort((a, b) => b.support - a.support);
  }

  // Group keywords into clusters representing potential modules
  groupKeywordsByCooccurrence(docs: SourceDocument[], minCooccurrences = 3) {
    const keywords = new Set(docs.flatMap((doc) => doc.keywords));

    const cooccurrenceMatrix = new Map<string, Map<string, number>>();

    keywords.forEach((keyword1) => {
      const innerMap = new Map<string, number>();
      keywords.forEach((keyword2) => {
        if (keyword1 !== keyword2) {
          const count = docs.filter(
            (doc) =>
              doc.keywords.includes(keyword1) && doc.keywords.includes(keyword2)
          ).length;
          innerMap.set(keyword2, count);
        }
      });
      cooccurrenceMatrix.set(keyword1, innerMap);
    });

    const clusters: string[][] = [];
    const processed = new Set<string>();

    keywords.forEach((starterKeyword) => {
      if (!processed.has(starterKeyword)) {
        const cluster = this.buildCluster(
          starterKeyword,
          cooccurrenceMatrix,
          processed,
          minCooccurrences
        );
        if (cluster.length > 1) clusters.push(cluster);
      }
    });

    return clusters;
  }

  private buildCluster(
    keyword: string,
    matrix: Map<string, Map<string, number>>,
    processed: Set<string>,
    minCooccurrences: number
  ): string[] {
    const cluster = [keyword];
    processed.add(keyword);

    const neighbors = Array.from(matrix.get(keyword)!.entries())
      .filter(([, count]) => count >= minCooccurrences)
      .sort((a, b) => b[1] - a[1]);

    neighbors.forEach(([relatedKeyword]) => {
      if (!processed.has(relatedKeyword)) {
        cluster.push(relatedKeyword);
        processed.add(relatedKeyword);
      }
    });

    return cluster;
  }

  // Calculate the importance of each keyword based on frequency and spread
  calculateKeywordSignificance(docs: SourceDocument[]) {
    const frequency = new Map<string, number>();
    const spread = new Map<string, number>();

    docs.forEach((doc) => {
      const docKeywords = new Set(doc.keywords);
      doc.keywords.forEach((keyword) => {
        frequency.set(keyword, (frequency.get(keyword) || 0) + 1);
      });
      docKeywords.forEach((keyword) => {
        spread.set(keyword, (spread.get(keyword) || 0) + 1);
      });
    });

    return Array.from(frequency.keys())
      .map((keyword) => ({
        keyword,
        frequency: frequency.get(keyword)! / docs.length,
        spread: spread.get(keyword)! / docs.length,
        significance:
          ((frequency.get(keyword)! / docs.length) * spread.get(keyword)!) /
          docs.length,
      }))
      .sort((a, b) => b.significance - a.significance);
  }

  // Example use case
  analyzeSourceModules(docs: SourceDocument[]) {
    console.log(
      "Keyword Associations for Modules:",
      this.identifyKeywordAssociations(docs)
    );
    console.log(
      "Keyword Clusters Suggesting Modules:",
      this.groupKeywordsByCooccurrence(docs)
    );
    // console.log(
    //   "Keyword Significance:",
    //   this.calculateKeywordSignificance(docs)
    // );
  }
}
