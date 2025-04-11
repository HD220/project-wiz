import { AuthToken, IAuthRepository } from "./types";

const SERVICE = "project-wiz-auth";
const ACCOUNT = "default";

export class AuthRepositoryKeytar implements IAuthRepository {
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

  async saveToken(token: AuthToken): Promise<void> {
    const keytar = await this.getKeytar();
    const data = JSON.stringify(token);
    await keytar.setPassword(SERVICE, ACCOUNT, data);
  }

  async loadToken(): Promise<AuthToken | null> {
    const keytar = await this.getKeytar();
    const data = await keytar.getPassword(SERVICE, ACCOUNT);
    if (!data) return null;
    try {
      return JSON.parse(data) as AuthToken;
    } catch {
      return null;
    }
  }

  async removeToken(): Promise<void> {
    const keytar = await this.getKeytar();
    await keytar.deletePassword(SERVICE, ACCOUNT);
  }
}