import NextAuth, { DefaultSession } from "next-auth";
import GitHub from "next-auth/providers/github";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    username: string;
    access_token: string;
  }

  interface Session {
    error?: "RefreshTokenError";
    user: {
      username: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username: string;
    access_token: string;
    expires_at: number;
    refresh_token?: string;
    error?: "RefreshTokenError";
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      account(account) {
        const refresh_token_expires_at =
          Math.floor(Date.now() / 1000) +
          Number(account.refresh_token_expires_in);
        return {
          access_token: account.access_token,
          expires_at: account.expires_at,
          refresh_token: account.refresh_token,
          refresh_token_expires_at,
        };
      },
      authorization: {
        params: { scope: "read:user repo read:org" },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // async authorized({ auth }) {
    //   return !!auth;
    // },
    async jwt({ token, account, profile }) {
      if (account) {
        try {
          if (Date.now() >= token.expires_at * 1000) {
            const response = await fetch(
              "https://github.com/login/oauth/access_token",
              {
                method: "POST",
                body: new URLSearchParams({
                  client_id: process.env.AUTH_GITHUB_ID!,
                  client_secret: process.env.AUTH_GITHUB_SECRET!,
                  grant_type: "refresh_token",
                  refresh_token: token.refresh_token!,
                }),
              }
            );

            const tokensOrError = await response.json();

            if (!response.ok) throw tokensOrError;

            const newTokens = tokensOrError as {
              access_token: string;
              expires_in: number;
              refresh_token?: string;
            };

            token.access_token = newTokens.access_token;
            token.expires_at = Math.floor(
              Date.now() / 1000 + newTokens.expires_in
            );
            if (newTokens.refresh_token)
              token.refresh_token = newTokens.refresh_token;
          }

          token.username = `${profile?.login || ""}`;
          token.access_token = account.access_token!;
          token.expires_at = account.expires_at!;
          token.refresh_token = account.refresh_token;

          return {
            ...token,
          };
        } catch (error) {
          console.error("Error refreshing access_token", error);
          token.error = "RefreshTokenError";
          return { ...token };
        }
      } else {
        return { ...token };
      }
    },
    async session({ session, token }) {
      session.user.access_token = token.access_token;
      session.user.username = token.username;
      session.error = token.error;
      return session;
    },
  },
});
