export interface IFileSystem {
  mkdir(path: string): Promise<void>;
  rmdir(path: string): Promise<void>;
  cd(path: string): Promise<void>;
  mv(source: string, destination: string): Promise<void>;
  cp(source: string, destination: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  ls(path: string): Promise<string[]>;
  read(path: string): Promise<string>;
  write(path: string, content: string): Promise<void>;
  cwd(path?: string): Promise<string>;
}
