import { LevenshteinDistanceSearch, TfIdf, WordTokenizer } from "natural";

export class ModuleNaming {
  private tfidf: TfIdf = new TfIdf();
  private tokenizer = new WordTokenizer({
    discardEmpty: true,
    gaps: true,
  });
  // new RegexpTokenizer({
  //   pattern: /(?=[A-Z][a-z])|(?<=[a-z])(?=[A-Z])|[_\-\s/\\:]/,
  // });
  private terms = new Set<string>();
  private readonly stopWords = new Set([
    "index",
    "get",
    "fetch",
    "create",
    "set",
    "verify",
    "post",
    "delete",
    "put",
    "jwt",
    "map",
    "by",
    "generate",
    "key",
    "build",
    "a",
    "as",
    "for",
  ]);

  constructor() {
    this.tfidf.setStopwords([...this.stopWords]);
  }

  tokenize(document: string) {
    return this.tokenizer
      .tokenize(document)
      .flatMap((term) =>
        term.split(/(?=[A-Z][a-z])|(?<=[a-z])(?=[A-Z])|[_\-\s/\\:]/)
      )
      .filter((token) => !this.stopWords.has(token.toLowerCase()))
      .map((term) => {
        const lowered = term.toLowerCase();
        this.terms.add(lowered);
        return lowered;
      });
  }

  addDocument(document: string) {
    const terms = this.tokenize(document);
    if (terms.length) this.tfidf.addDocument(terms);
  }

  termsMatching(termA: string, termB: string) {
    return LevenshteinDistanceSearch(termA, termB);
  }

  capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  getScoreTerm(term: string) {
    const total = this.tfidf.documents
      .map((_, idx) => this.tfidf.tfidf(term, idx) || 0)
      .reduce((acc, cur) => acc + cur, 0);
    return total / this.tfidf.documents.length;
  }

  getScore() {
    return new Map(
      [...this.terms].map((term) => [term, this.getScoreTerm(term)])
    );
  }

  inferName(maxLenth: number = 20) {
    const termScores = Array.from(this.getScore());
    const sumScore = termScores.reduce((acc, [, score]) => acc + score, 0.0);
    const averageScore = sumScore / Math.max(termScores.length, 1);

    const selectedTokens = termScores
      .filter(([, score]) => score >= averageScore)
      .sort((a, b) => b[1] - a[1])
      .map(([token]) => this.capitalize(token));

    return this.untilMaxLength(selectedTokens, maxLenth).sort().reverse();
  }

  private untilMaxLength(tokens: string[], length: number) {
    const name: string[] = [];
    for (let i = 0; i < tokens.length; i++) {
      if ((name + tokens[i]).length <= length) {
        name.push(tokens.shift() || "");
      }
    }
    return name;
  }
}
