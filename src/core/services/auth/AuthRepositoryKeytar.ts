import keytar from "keytar";
import { AuthToken, IAuthRepository } from "./types";

const SERVICE = "project-wiz-auth";
const ACCOUNT = "default";

export class AuthRepositoryKeytar implements IAuthRepository {
  async saveToken(token: AuthToken): Promise<void> {
    const data = JSON.stringify(token);
    await keytar.setPassword(SERVICE, ACCOUNT, data);
  }

  async loadToken(): Promise<AuthToken | null> {
    const data = await keytar.getPassword(SERVICE, ACCOUNT);
    if (!data) return null;
    try {
      return JSON.parse(data) as AuthToken;
    } catch {
      return null;
    }
  }

  async removeToken(): Promise<void> {
    await keytar.deletePassword(SERVICE, ACCOUNT);
  }
}