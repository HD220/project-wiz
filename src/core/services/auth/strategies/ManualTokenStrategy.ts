import { AuthToken, IAuthRepository, IGitHubOAuthService } from "../types";
import * as GitHubTokenManager from "../../../infrastructure/electron/github/GitHubTokenManagerGateway";

export class ManualTokenStrategy {
  private repository: IAuthRepository;

  constructor(repository: IAuthRepository) {
    this.repository = repository;
  }

  async loginWithToken(rawToken: string): Promise<AuthToken> {
    const type = this.detectTokenType(rawToken);
    if (!type) {
      throw new Error("Token inválido ou não suportado.");
    }

    const tokenObj: AuthToken = {
      token: rawToken,
      type,
      createdAt: new Date(),
    };

    await this.repository.saveToken(tokenObj);
    return tokenObj;
  }

  private detectTokenType(token: string): 'pat' | 'oauth' | null {
    if (token.startsWith("ghp_")) return "pat";
    if (token.startsWith("gho_") || token.startsWith("ghu_")) return "oauth";
    return null;
  }
}