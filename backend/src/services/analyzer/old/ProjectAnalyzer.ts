import { Project, SourceFile } from "ts-morph";
import { PorterStemmer, TfIdf, TfIdfTerm, WordTokenizer } from "natural";
import nlp from "compromise";
import fg from "fast-glob";
import path from "node:path";
import { RepositoryAnalyzer } from "../RepositoryAnalyzer";

type Collection = {
  name: string;
  documents: string[];
  words: { term: string; tf: number; idf: number; tfidf: number }[];
};

export class ProjectAnalyzer {
  private vocabulary: Map<string, Set<string>> = new Map();

  constructor() {}

  async analyze(projectPath: string) {
    const repositoryAnalyzer = new RepositoryAnalyzer();

    const analyze = await repositoryAnalyzer.analyzeRepository(projectPath);

    const documents = analyze.flatMap((analyze) =>
      analyze.analysis.fileAnalysis.flatMap((file) =>
        file.blocks.map((block) => `${file.path} ${block.content}`)
      )
    );

    const docTerms = this.extractImportantTerms(documents);

    const collection: Collection[] = docTerms.map((doc) => {
      return {
        name: doc.terms
          .slice(0, 2)
          .map((term) => {
            const value = this.vocabulary.get(term.term)?.[0] || "";
            return this.capitalize(value);
          })
          .join(" "),
        documents: [doc.content],
        words: doc.terms.map((value) => ({
          ...value,
          term: this.vocabulary.get(value.term)?.[0] || "",
        })),
      };
    });
  }

  private mergeCollections(collections: Collection[]): Collection[] {
    const mergedCollections: Collection[] = [];
    const usedCollectionIndexes = new Set<number>();

    for (let i = 0; i < collections.length; i++) {
      if (usedCollectionIndexes.has(i)) continue;

      let currentCollection = collections[i];
      const termsSource = currentCollection.words.map(({ term }) => term);

      for (let j = i + 1; j < collections.length; j++) {
        if (usedCollectionIndexes.has(j)) continue;

        const termsTarget = collections[j].words.map(({ term }) => term);
        const sharedTerms = termsSource.filter((source) =>
          termsTarget.includes(source)
        );

        // Corrigir cálculo de similaridade
        const similarity =
          sharedTerms.length > 0
            ? (sharedTerms.length * 100) /
              new Set([...termsSource, ...termsTarget]).size
            : 0;

        if (similarity >= 30) {
          currentCollection = {
            name: [...currentCollection.words, ...collections[j].words]
              .sort((a, b) => b.tfidf - a.tfidf)
              .slice(0, 2)
              .map((term) => {
                const value = this.vocabulary.get(term.term)?.[0] || "";
                return this.capitalize(value);
              })
              .join(" "),
            documents: [
              ...currentCollection.documents,
              ...collections[j].documents,
            ],
            words: [
              ...new Set([...currentCollection.words, ...collections[j].words]),
            ].sort((a, b) => b.tfidf - a.tfidf),
          };

          usedCollectionIndexes.add(j);
        }
      }

      mergedCollections.push(currentCollection);
      usedCollectionIndexes.add(i);
    }

    // Encontrar as coleções não usadas (resto)
    const rest = collections.filter(
      (_, index) => !usedCollectionIndexes.has(index)
    );

    return [...mergedCollections, ...rest];
  }

  private extractImportantTerms(documents: string[]) {
    const tfidf = new TfIdf();

    documents.forEach((doc) => {
      tfidf.addDocument(this.tokenize(doc).map(({ stem }) => stem));
    });

    return tfidf.documents.map((doc, idx) => ({
      content: documents[idx],
      terms: tfidf.listTerms(idx).map((value) => ({ ...value })),
    }));
  }

  private tokenize(text: string) {
    const tokenizer = new WordTokenizer();
    return tokenizer
      .tokenize(text)
      .flatMap((word) =>
        word.split(/(?=[A-Z][a-z])|(?<=[a-z])(?=[A-Z])|[_\-\s/\\:]/)
      )
      .map((word) => {
        const stem = PorterStemmer.stem(word).toLowerCase();
        const old = [...(this.vocabulary.get(stem) || [])];

        this.vocabulary.set(stem, new Set([...old, word]));

        return { orig: word, stem };
      });
  }

  private capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
}

export class EnhancedProjectAnalyzer {
  private projectPath: string;
  private tfidf: TfIdf;
  private documents: Document[];

  constructor(projectPath: string) {
    this.projectPath = projectPath;

    this.tfidf = new TfIdf();
    this.documents = [];
  }

  private tokenize(text: string) {
    const tokenizer = new WordTokenizer();
    return tokenizer
      .tokenize(text)
      .flatMap((word) =>
        word.split(/(?=[A-Z][a-z])|(?<=[a-z])(?=[A-Z])|[_\-\s/\\:]/)
      )
      .map((word) => ({
        orig: word,
        kw: PorterStemmer.stem(word).toLowerCase(),
      }));
  }

  async analyze() {
    const tsconfigFiles = await fg(
      fg.convertPathToPattern(
        path.join(this.projectPath, "**", "tsconfig.json")
      )
    );

    if (tsconfigFiles.length === 0) {
      throw new Error("No tsconfig.json files found");
    }

    const projects = tsconfigFiles.map(
      (tsConfigPath) => new Project({ tsConfigFilePath: tsConfigPath })
    );

    const sourceFiles = projects.flatMap((project) => project.getSourceFiles());

    // Process each source file
    sourceFiles.forEach((sourceFile) => {
      const keywords = this.tokenize(sourceFile.getFullText());
      //   const doc = nlp(text);
      //   const keywords = doc
      //     .nouns()
      //     .out("array")
      //     .concat(doc.verbs().out("array"));

      this.tfidf.addDocument(keywords);
      this.documents.push({ words: keywords });
    });

    const filterGreaterAverage = (value: TfIdfTerm[]) => {
      const average =
        value.reduce((sum, term) => sum + term.tfidf, 0) / value.length;

      return value.filter((term) => term.tfidf >= average);
    };

    const lda = new ImprovedLDA(
      this.documents.map((doc, id) => {
        const terms = this.tfidf.listTerms(id);
        return {
          words: filterGreaterAverage(
            filterGreaterAverage(filterGreaterAverage(terms))
          ).map((term) => term.term),
        };
      })
    );
    const { topics, topicDetails } = lda.extractTopics();

    console.log("=== Tópicos Extraídos ===");
    topics.forEach((topic, index) => {
      console.log(`Tópico ${index + 1}:`, topic);
      console.log("Detalhes:", topicDetails[index]);
      console.log("---");
    });
  }
}

// LDA implementation integrated from provided code
class ImprovedLDA {
  private documents: Document[];
  private vocabulary: Map<string, number>;
  private wordFrequency: Map<string, number>;
  //   private topicThreshold: number;
  private entropyThreshold: number;

  constructor(
    documents: Document[],
    // topicThreshold: number = 0.1,
    entropyThreshold: number = 0.5
  ) {
    this.documents = documents;
    // this.topicThreshold = topicThreshold;
    this.entropyThreshold = entropyThreshold;
    this.vocabulary = new Map();
    this.wordFrequency = new Map();

    this.preprocessDocuments();
  }

  private preprocessDocuments() {
    this.documents.forEach((doc) => {
      doc.words.forEach((word) => {
        const normalizedWord = this.normalizeWord(word);
        const currentFreq = this.wordFrequency.get(normalizedWord) || 0;
        this.wordFrequency.set(normalizedWord, currentFreq + 1);
      });
    });

    let vocabIndex = 0;
    this.wordFrequency.forEach((freq, word) => {
      if (freq > 1) {
        this.vocabulary.set(word, vocabIndex++);
      }
    });
  }

  private normalizeWord(word: string): string {
    return word.toLowerCase().trim();
  }

  private calculateEntropy(distribution: number[]): number {
    const totalElements = distribution.reduce((a, b) => a + b, 0);
    const probabilities = distribution.map((x) => x / totalElements);

    return probabilities.reduce((entropy, p) => {
      return p > 0 ? entropy - p * Math.log2(p) : entropy;
    }, 0);
  }

  private identifyTopics(): string[][] {
    const topicCandidates: Map<string, Set<string>> = new Map();

    this.documents.forEach((doc) => {
      const uniqueWords = new Set(doc.words.map(this.normalizeWord));

      uniqueWords.forEach((word) => {
        const relatedWords = new Set<string>();

        uniqueWords.forEach((relatedWord) => {
          if (word !== relatedWord) {
            relatedWords.add(relatedWord);
          }
        });

        if (!topicCandidates.has(word)) {
          topicCandidates.set(word, relatedWords);
        }
      });
    });

    // console.log("topicCandidates", topicCandidates.size);

    const significantTopics: string[][] = [];

    topicCandidates.forEach((relatedWords, baseWord) => {
      const topicWords = Array.from(relatedWords).filter((word) => {
        const freq = this.wordFrequency.get(word) || 0;
        return freq > 1;
      });
      // .slice(0, 5);

      const wordFreqs = topicWords.map(
        (word) => this.wordFrequency.get(word) || 0
      );

      const topicEntropy = this.calculateEntropy(wordFreqs);

      console.log("topicEntropy", this.entropyThreshold, topicEntropy);

      if (topicEntropy > this.entropyThreshold) {
        significantTopics.push([baseWord, ...topicWords]);
      }
    });

    return significantTopics;
  }

  public extractTopics() {
    const topics = this.identifyTopics();

    const topicDetails = topics.map((topicWords) => {
      const wordFreqs = topicWords.map(
        (word) => this.wordFrequency.get(word) || 0
      );

      return {
        words: topicWords,
        entropy: this.calculateEntropy(wordFreqs),
        frequency: wordFreqs.reduce((a, b) => a + b, 0),
      };
    });

    const sortedTopicDetails = topicDetails.sort(
      (a, b) => b.frequency - a.frequency
    );

    return {
      topics: sortedTopicDetails.map((detail) => detail.words),
      topicDetails: sortedTopicDetails,
    };
  }
}
