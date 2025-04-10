export interface CredentialInfo {
  id: string;
  provider: 'github' | 'gitlab' | 'bitbucket' | string;
  description?: string;
  username?: string;
}

export interface SaveCredentialParams {
  id: string;
  provider: 'github' | 'gitlab' | 'bitbucket' | string;
  token: string;
  description?: string;
  username?: string;
}

export interface ICredentialStoragePort {
  saveCredential(params: SaveCredentialParams): Promise<void>;

  getCredential(id: string): Promise<string | null>;

  deleteCredential(id: string): Promise<void>;

  listCredentials(): Promise<CredentialInfo[]>;
}