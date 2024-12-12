import { TfidfCalculator } from './tfidf-calculator';

interface CodeBlock {
  id: string;
  content: string;
  keywords: string[];
}

interface ModuleNode {
  name: string;
  level: number;
  keywords: string[];
  subModules?: ModuleNode[];
  representativeBlocks?: CodeBlock[];
}

class ModuleAnalyzer {
  private tfidfCalculator: TfidfCalculator;

  constructor() {
    this.tfidfCalculator = new TfidfCalculator();
  }

  // Calculador de TF-IDF simples
  class TfidfCalculator {
    calculateTFIDF(documents: string[][]): Map<string, number> {
      const termFrequencies = this.calculateTermFrequency(documents);
      const inverseDocumentFrequency = this.calculateIDF(documents);
      const tfidfScores = new Map<string, number>();

      for (const [term, tf] of termFrequencies) {
        const idf = inverseDocumentFrequency.get(term) || 1;
        tfidfScores.set(term, tf * idf);
      }

      return tfidfScores;
    }

    private calculateTermFrequency(documents: string[][]): Map<string, number> {
      const termFreq = new Map<string, number>();
      documents.forEach(doc => {
        doc.forEach(term => {
          termFreq.set(term, (termFreq.get(term) || 0) + 1);
        });
      });
      return termFreq;
    }

    private calculateIDF(documents: string[][]): Map<string, number> {
      const documentCount = documents.length;
      const documentFrequency = new Map<string, number>();

      documents.forEach(doc => {
        const uniqueTerms = new Set(doc);
        uniqueTerms.forEach(term => {
          documentFrequency.set(term, (documentFrequency.get(term) || 0) + 1);
        });
      });

      const idfScores = new Map<string, number>();
      documentFrequency.forEach((freq, term) => {
        idfScores.set(term, Math.log(documentCount / freq));
      });

      return idfScores;
    }
  }

  // Método para extrair termos-chave com maior relevância
  private extractKeyTerms(
    documents: string[][], 
    threshold: number = 0.7
  ): string[] {
    const tfidfScores = this.tfidfCalculator.calculateTFIDF(documents);
    
    return Array.from(tfidfScores.entries())
      .filter(([term, score]) => score > threshold)
      .map(([term]) => term);
  }

  // Método para gerar nome de módulo
  private generateModuleName(keywords: string[]): string {
    const strategies = [
      () => keywords.slice(0, 2).join('-'),
      () => keywords[0],
      () => keywords.reduce((a, b) => a.length > b.length ? a : b)
    ];

    const selectedStrategy = strategies[
      Math.floor(Math.random() * strategies.length)
    ];

    return selectedStrategy()
      .replace(/^\w/, c => c.toUpperCase());
  }

  // Método para agrupar blocos de código
  private clusterCodeBlocks(
    codeBlocks: CodeBlock[], 
    keyTerms: string[]
  ): ModuleNode[] {
    // Agrupa por termos compartilhados
    const clusteredModules: ModuleNode[] = [];
    const processedBlocks = new Set<string>();

    codeBlocks.forEach(block => {
      if (processedBlocks.has(block.id)) return;

      // Encontra blocos similares
      const similarBlocks = codeBlocks.filter(
        otherBlock => 
          otherBlock.id !== block.id &&
          otherBlock.keywords.some(kw => block.keywords.includes(kw)) &&
          !processedBlocks.has(otherBlock.id)
      );

      const moduleBlocks = [block, ...similarBlocks];
      processedBlocks.add(block.id);
      similarBlocks.forEach(b => processedBlocks.add(b.id));

      // Extrair keywords do módulo
      const moduleKeywords = Array.from(
        new Set(moduleBlocks.flatMap(b => b.keywords))
      );

      const moduleNode: ModuleNode = {
        name: this.generateModuleName(moduleKeywords),
        level: 0,
        keywords: moduleKeywords,
        representativeBlocks: moduleBlocks,
        subModules: this.generateSubModules(moduleBlocks, moduleKeywords)
      };

      clusteredModules.push(moduleNode);
    });

    return clusteredModules;
  }

  // Método para criar submódulos
  private generateSubModules(
    moduleBlocks: CodeBlock[], 
    parentKeywords: string[]
  ): ModuleNode[] {
    // Identificação de submódulos por termos mais específicos
    const subModules: ModuleNode[] = [];
    const processedBlocks = new Set<string>();

    moduleBlocks.forEach(block => {
      if (processedBlocks.has(block.id)) return;

      const subModuleKeywords = block.keywords
        .filter(kw => !parentKeywords.includes(kw));

      if (subModuleKeywords.length > 0) {
        const subModule: ModuleNode = {
          name: this.generateModuleName(subModuleKeywords),
          level: 1,
          keywords: subModuleKeywords,
          representativeBlocks: [block]
        };

        subModules.push(subModule);
        processedBlocks.add(block.id);
      }
    });

    return subModules.length > 0 ? subModules : undefined;
  }

  // Método principal de análise
  public analyzeCodeBlocks(codeBlocks: CodeBlock[]): ModuleNode[] {
    // Converte blocos para formato de documentos
    const documents = codeBlocks.map(block => block.keywords);
    
    // Extrai termos-chave relevantes
    const keyTerms = this.extractKeyTerms(documents);
    
    // Agrupa blocos em módulos
    const moduleHierarchy = this.clusterCodeBlocks(codeBlocks, keyTerms);

    return moduleHierarchy;
  }

  // Método para imprimir hierarquia de módulos
  public printModuleHierarchy(modules: ModuleNode[]) {
    modules.forEach(module => {
      console.log(`Module: ${module.name}`);
      console.log(`  Level: ${module.level}`);
      console.log(`  Keywords: ${module.keywords.join(', ')}`);
      
      if (module.representativeBlocks) {
        console.log('  Representative Blocks:');
        module.representativeBlocks.forEach(block => 
          console.log(`    - ${block.id}`)
        );
      }

      if (module.subModules) {
        console.log('  Submodules:');
        module.subModules.forEach(subModule => {
          console.log(`    Submodule: ${subModule.name}`);
          console.log(`      Keywords: ${subModule.keywords.join(', ')}`);
          if (subModule.representativeBlocks) {
            console.log('      Representative Blocks:');
            subModule.representativeBlocks.forEach(block => 
              console.log(`        - ${block.id}`)
            );
          }
        });
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

const analyzer = new ModuleAnalyzer();
const moduleHierarchy = analyzer.analyzeCodeBlocks(codeBlocks);
analyzer.printModuleHierarchy(moduleHierarchy);
