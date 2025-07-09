export interface IGitService {
  clone(repoUrl: string, localPath: string): Promise<string>;
  init(): Promise<string>;
  pull(): Promise<string>;
}
