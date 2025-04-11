import path from 'path';
import fs from 'fs/promises';
import { ICredentialStoragePort, SaveCredentialParams, CredentialInfo } from '../../../domain/ports/credential-storage.port';

const SERVICE_NAME = 'project-wiz-git-credentials';
const METADATA_FILE = path.join(process.env.APPDATA || '.', 'project-wiz-git-credentials.json');

export class CredentialStorageAdapter implements ICredentialStoragePort {
  private _keytar: typeof import('keytar') | null = null;

  private async getKeytar() {
    if (!this._keytar) {
      try {
        this._keytar = (await import('keytar')).default;
      } catch (error) {
        throw new Error('Failed to load keytar module: ' + error);
      }
    }
    return this._keytar;
  }

  private async loadMetadata(): Promise<Record<string, CredentialInfo>> {
    try {
      const content = await fs.readFile(METADATA_FILE, 'utf-8');
      return JSON.parse(content);
    } catch {
      return {};
    }
  }

  private async saveMetadata(metadata: Record<string, CredentialInfo>): Promise<void> {
    await fs.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2), 'utf-8');
  }

  async saveCredential(params: SaveCredentialParams): Promise<void> {
    const keytar = await this.getKeytar();
    await keytar.setPassword(SERVICE_NAME, params.id, params.token);

    const metadata = await this.loadMetadata();
    metadata[params.id] = {
      id: params.id,
      provider: params.provider,
      description: params.description,
      username: params.username,
    };
    await this.saveMetadata(metadata);
  }

  async getCredential(id: string): Promise<string | null> {
    const keytar = await this.getKeytar();
    return keytar.getPassword(SERVICE_NAME, id);
  }

  async deleteCredential(id: string): Promise<void> {
    const keytar = await this.getKeytar();
    await keytar.deletePassword(SERVICE_NAME, id);

    const metadata = await this.loadMetadata();
    delete metadata[id];
    await this.saveMetadata(metadata);
  }

  async listCredentials(): Promise<CredentialInfo[]> {
    const metadata = await this.loadMetadata();
    return Object.values(metadata);
  }
}