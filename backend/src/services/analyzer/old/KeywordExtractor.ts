import {
  BayesClassifier,
  LancasterStemmer,
  PorterStemmer,
  Stemmer,
  TfIdf,
  WordTokenizer,
} from "natural";

export class KeywordExtractor {
  private splitPattern = /(?=[A-Z][a-z])|(?<=[a-z])(?=[A-Z])|[_\-\s/\\:]/;
  private readonly stopWords = new Set([
    "index",
    "ts",
    "tsx",
    // "error",
    // "main",
    // "app",
    // "root",
    // "use",
  ]);
  private tfidf: TfIdf;
  private bayer: BayesClassifier;
  private stemmer: Stemmer;
  private tokenizer: WordTokenizer;
  private documents: { [key: string]: { keyword: string; score: number }[] };

  constructor() {
    this.tfidf = new TfIdf();
    this.stemmer = PorterStemmer;
    this.bayer = new BayesClassifier(PorterStemmer);
    this.tokenizer = new WordTokenizer({
      discardEmpty: true,
      gaps: true,
    });
    this.documents = {};
  }

  addDocument(document: string, key: string) {
    const tokens = this.tokenize(document);
    const stemmed = tokens.map((token) => {
      const stemmed = this.stemmer.stem(token);

      this.bayer.addDocument([stemmed], token);

      return stemmed;
    });

    this.tfidf.addDocument(stemmed, key);
  }

  splitByWords(input: string, maxLength: number = 100) {
    const words = input.split(this.splitPattern);
    const parts: string[] = [];
    let currentPart = "";

    for (const word of words) {
      if ((currentPart + word).length > maxLength) {
        parts.push(currentPart.trim());
        currentPart = word + " ";
      } else {
        currentPart += word + " ";
      }
    }
    if (currentPart) {
      parts.push(currentPart.trim());
    }
    return parts;
  }

  private tokenize(document: string) {
    const chunks = [document];
    // this.splitByWords(
    //   document
    //     .replace(/\/\/.*$/gm, "") // Remove comentários de linha
    //     .replace(/\/\*[\s\S]*?\*\//g, "") // Remove comentários de bloco
    //     .replace(/['"`].*?['"`]/g, "") // Remove strings
    //     .replace(/[^\w\s]/g, " ")
    // );

    return chunks.flatMap((chunk) => {
      return this.tokenizer
        .tokenize(chunk)
        .flatMap((term) => term.split(this.splitPattern))
        .map((term) => term.toLowerCase())
        .filter(
          (term) =>
            // term.length > 2 &&
            !/\d+/.test(term) && !this.stopWords.has(term)
        );
    });
  }

  classify() {
    this.bayer.train();
    const docTermScores: Map<
      string,
      Map<string, { score: number; count: number }>
    > = new Map();

    this.tfidf.documents.forEach((doc, idx) => {
      if (!docTermScores.has(String(doc.__key)))
        docTermScores.set(String(doc.__key), new Map());

      const currentDoc = docTermScores.get(String(doc.__key));

      this.collectDocumentKeywords(idx).forEach((value) => {
        const { count = 1, score = 0 } = currentDoc?.get(value.keyword) || {};
        currentDoc?.set(value.keyword, {
          count: count + 1,
          score: score + value.score,
        });
      });

      Array.from(docTermScores.entries()).forEach(([key, termsScores]) => {
        const consolidatedResults = Array.from(termsScores.entries()).map(
          ([term, { score, count }]) => ({
            keyword: this.capitalize(term),
            score: score / count,
          })
        );
        this.documents[key] = consolidatedResults;
      });
    });
  }

  private collectDocumentKeywords(index: number) {
    const tokensCount = this.tfidf.listTerms(index).length;
    const average =
      this.tfidf.listTerms(index).reduce((sum, value) => sum + value.tfidf, 0) /
      tokensCount;

    const stemmed = this.tfidf.listTerms(index);
    // .filter((value) => {
    //   return value.tfidf >= average;
    // });
    // .slice(
    //   0,
    //   Math.max(
    //     1,
    //     Math.min(Math.floor(Math.log(tokensCount) / Math.log(Math.E) + 1), 4)
    //   )
    // );
    const stemmedAverage =
      stemmed.reduce((sum, value) => sum + value.tfidf, 0) / stemmed.length;

    return (
      stemmed
        // .filter((value) => value.tfidf >= stemmedAverage)
        .map((value) => ({
          keyword: this.bayer.classify([value.term]),
          score: value.tfidf,
        }))
    );
  }

  capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  getDocumentKeywords(key: string) {
    if (!this.documents[key]) return [];
    return this.documents[key];
  }

  inferDocumentName(key: string) {
    if (!this.documents[key]) return "";

    const keywords = this.documents[key]
      .sort((a, b) => b.score - a.score)
      .slice(
        0,
        Math.max(
          1,
          Math.min(
            Math.floor(
              Math.log(this.documents[key].length) / Math.log(Math.E) + 1
            ),
            4
          )
        )
      )
      .sort()
      .map((value) => this.capitalize(value.keyword))
      .join(" ");

    return keywords;
  }
}
