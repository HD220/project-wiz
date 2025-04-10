export class StopSequences {
  private readonly sequences: string[];

  private constructor(sequences: string[]) {
    this.sequences = sequences;
  }

  public static create(sequences: string[]): StopSequences {
    if (!Array.isArray(sequences)) {
      throw new Error('StopSequences deve ser um array de strings');
    }
    for (const seq of sequences) {
      if (typeof seq !== 'string' || seq.trim() === '') {
        throw new Error('Cada stop sequence deve ser uma string não vazia');
      }
    }
    return new StopSequences(sequences);
  }

  public getSequences(): string[] {
    return this.sequences;
  }
}