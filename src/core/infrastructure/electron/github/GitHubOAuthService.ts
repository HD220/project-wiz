import { BrowserWindow, session } from "electron";
import fetch from "node-fetch";
import { IGitHubOAuthService, AuthToken } from "../../../services/auth/types";

const CLIENT_ID = "YOUR_CLIENT_ID";
const CLIENT_SECRET = "YOUR_CLIENT_SECRET";
const REDIRECT_URI = "http://localhost/callback";

export class GitHubOAuthService implements IGitHubOAuthService {
  async startOAuthFlow(): Promise<AuthToken> {
    return new Promise<AuthToken>((resolve, reject) => {
      const authWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
      )}&scope=repo%20read:user`;

      authWindow.loadURL(authUrl);

      const filter = { urls: [`${REDIRECT_URI}*`] };

      session.defaultSession.webRequest.onCompleted(filter, async (details) => {
        const url = new URL(details.url);
        const code = url.searchParams.get("code");
        if (!code) {
          reject(new Error("Código OAuth não encontrado."));
          authWindow.close();
          return;
        }

        try {
          const token = await this.exchangeCodeForToken(code);
          const authToken: AuthToken = {
            token,
            type: "oauth",
            createdAt: new Date(),
          };
          resolve(authToken);
        } catch (err) {
          reject(err);
        } finally {
          authWindow.close();
        }
      });
    });
  }

  private async exchangeCodeForToken(code: string): Promise<string> {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = await response.json();
    if (!data.access_token) {
      throw new Error("Falha ao obter access token do GitHub.");
    }
    return data.access_token;
  }
}