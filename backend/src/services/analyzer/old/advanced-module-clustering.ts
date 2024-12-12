import * as natural from 'natural';

interface CodeBlock {
  id: string;
  content: string;
  keywords: string[];
}

interface ModuleNode {
  id: string;
  name: string;
  blocks: CodeBlock[];
  dependencies: string[];
  subModules?: ModuleNode[];
}

interface KeywordScore {
  keyword: string;
  score: number;
}

class AdvancedModuleAnalyzer {
  private tfidf: natural.TfIdf;

  constructor() {
    this.tfidf = new natural.TfIdf();
  }

  // Calcula threshold de similaridade dinamicamente
  private calculateSimilarityThreshold(codeBlocks: CodeBlock[]): number {
    // Calcula distribuição de similaridades entre todos os blocos
    const similarities: number[] = [];
    
    for (let i = 0; i < codeBlocks.length; i++) {
      for (let j = i + 1; j < codeBlocks.length; j++) {
        similarities.push(this.calculateBlockSimilarity(
          codeBlocks[i], 
          codeBlocks[j]
        ));
      }
    }

    // Calcula threshold baseado na média e desvio padrão
    const mean = similarities.reduce((a, b) => a + b, 0) / similarities.length;
    const variance = similarities.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / similarities.length;
    const stdDev = Math.sqrt(variance);

    // Threshold dinâmico: média + 0.5 * desvio padrão
    return mean + 0.5 * stdDev;
  }

  // Calcula similaridade entre blocos
  private calculateBlockSimilarity(block1: CodeBlock, block2: CodeBlock): number {
    const commonKeywords = block1.keywords.filter(kw => 
      block2.keywords.includes(kw)
    );
    return commonKeywords.length / Math.max(block1.keywords.length, block2.keywords.length);
  }

  // Explora relações com profundidade dinâmica
  private exploreRelations(
    seed: CodeBlock, 
    codeBlocks: CodeBlock[], 
    similarityThreshold: number
  ): CodeBlock[] {
    const relatedBlocks = new Set<CodeBlock>([seed]);
    const visited = new Set<string>([seed.id]);
    
    // Calcula profundidade máxima baseada na quantidade de blocos
    const maxDepth = Math.ceil(Math.log(codeBlocks.length));

    const exploreRecursively = (
      block: CodeBlock, 
      currentDepth: number, 
      maxCurrentDepth: number
    ) => {
      if (currentDepth >= maxCurrentDepth) return;

      const directlyRelated = codeBlocks.filter(
        otherBlock => 
          !visited.has(otherBlock.id) &&
          this.calculateBlockSimilarity(block, otherBlock) >= similarityThreshold
      );

      directlyRelated.forEach(related => {
        visited.add(related.id);
        relatedBlocks.add(related);
        
        // Ajusta profundidade máxima recursivamente
        const remainingDepth = maxCurrentDepth - currentDepth;
        exploreRecursively(
          related, 
          currentDepth + 1, 
          Math.max(1, remainingDepth)
        );
      });
    };

    exploreRecursively(seed, 0, maxDepth);

    return Array.from(relatedBlocks);
  }

  // Geração de nome de módulo com base no score do TFIDF
  private inferDocumentName(keywords: string[]): string {
    // Adiciona keywords ao TFIDF para calcular scores
    keywords.forEach(kw => this.tfidf.addDocument([kw]));

    // Obtém scores dos termos
    const keywordScores: KeywordScore[] = keywords.map(keyword => ({
      keyword: keyword,
      score: this.tfidf.tfidf(keyword, 0)
    }));

    // Ordena por score
    const sortedKeywords = keywordScores.sort((a, b) => b.score - a.score);

    // Determina quantidade de keywords baseado no log da quantidade de termos
    const keywordsToUse = Math.max(
      1, 
      Math.min(
        Math.floor(Math.log(keywords.length) / Math.log(Math.E) + 1),
        4
      )
    );

    return sortedKeywords
      .slice(0, keywordsToUse)
      .map(kw => this.capitalize(kw.keyword))
      .sort()
      .join(' ');
  }

  // Capitaliza primeira letra
  private capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  // Agrupa blocos em módulos
  private clusterBlocksIntoModules(codeBlocks: CodeBlock[]): ModuleNode[] {
    const similarityThreshold = this.calculateSimilarityThreshold(codeBlocks);
    const modules: ModuleNode[] = [];
    const processedBlocks = new Set<string>();

    // Encontra sementes de módulos (blocos mais conectados)
    const moduleSeeds = codeBlocks
      .sort((a, b) => {
        const aRelated = codeBlocks.filter(block => 
          this.calculateBlockSimilarity(a, block) >= similarityThreshold
        ).length;
        const bRelated = codeBlocks.filter(block => 
          this.calculateBlockSimilarity(b, block) >= similarityThreshold
        ).length;
        return bRelated - aRelated;
      })
      .slice(0, Math.ceil(codeBlocks.length * 0.3));

    moduleSeeds.forEach(seed => {
      if (processedBlocks.has(seed.id)) return;

      const moduleBlocks = this.exploreRelations(seed, codeBlocks, similarityThreshold)
        .filter(block => !processedBlocks.has(block.id));

      moduleBlocks.forEach(block => processedBlocks.add(block.id));

      // Identifica dependências de outros módulos
      const moduleDependencies = new Set<string>();
      moduleBlocks.forEach(block => {
        codeBlocks
          .filter(otherBlock => 
            !moduleBlocks.includes(otherBlock) && 
            this.calculateBlockSimilarity(block, otherBlock) > 0
          )
          .forEach(depBlock => moduleDependencies.add(depBlock.id));
      });

      const moduleKeywords = Array.from(
        new Set(moduleBlocks.flatMap(block => block.keywords))
      );

      const module: ModuleNode = {
        id: `module_${seed.id}`,
        name: this.inferDocumentName(moduleKeywords),
        blocks: moduleBlocks,
        dependencies: Array.from(moduleDependencies)
      };

      modules.push(module);
    });

    return modules;
  }

  // Análise principal
  public analyzeCodeBlocks(codeBlocks: CodeBlock[]): ModuleNode[] {
    return this.clusterBlocksIntoModules(codeBlocks);
  }

  // Impressão da hierarquia
  public printModuleHierarchy(modules: ModuleNode[]) {
    modules.forEach(module => {
      console.log(`Módulo: ${module.name} (ID: ${module.id})`);
      console.log('  Blocos:');
      module.blocks.forEach(block => 
        console.log(`    - ${block.id}: ${block.keywords.join(', ')}`)
      );
      
      if (module.dependencies.length > 0) {
        console.log('  Dependências:');
        module.dependencies.forEach(dep => 
          console.log(`    - ${dep}`)
        );
      }
      console.log('');
    });
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
  },
  { 
    id: 'product-list', 
    content: 'function listProducts() { ... }', 
    keywords: ['product', 'list', 'inventory']
  },
  { 
    id: 'order-create', 
    content: 'function createOrder() { ... }', 
    keywords: ['order', 'create', 'transaction']
  }
];

const analyzer = new AdvancedModuleAnalyzer();
const moduleHierarchy = analyzer.analyzeCodeBlocks(codeBlocks);
analyzer.printModuleHierarchy(moduleHierarchy);
