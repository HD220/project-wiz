import keytar from 'keytar';
import path from 'path';
import fs from 'fs/promises';
import { ICredentialStoragePort, SaveCredentialParams, CredentialInfo } from '../../../domain/ports/credential-storage.port';

const SERVICE_NAME = 'project-wiz-git-credentials';
const METADATA_FILE = path.join(process.env.APPDATA || '.', 'project-wiz-git-credentials.json');

export class CredentialStorageAdapter implements ICredentialStoragePort {
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
    return keytar.getPassword(SERVICE_NAME, id);
  }

  async deleteCredential(id: string): Promise<void> {
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