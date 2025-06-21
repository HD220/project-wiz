export interface DocumentVersion {
  id: string;
  path: string;
  content: string;
  hash: string;
  createdAt: Date;
  author: string;
  metadata: {
    links: string[];
    terms: string[];
    examples: number;
  };
}
