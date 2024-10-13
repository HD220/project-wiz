import NextAuth, { DefaultSession } from "next-auth";
import GitHub from "next-auth/providers/github";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    access_token: string;
    username: string;
    github_id: string;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      github_id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    access_token: string;
    username: string;
    github_id: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      authorization: {
        params: { scope: "read:user repo read:org" },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id!;
        token.access_token = account!.access_token!;
        token.github_id = profile!.id!;
        token.username = profile!.login as string;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.access_token = token.access_token;
      session.user.username = token.username;
      session.user.github_id = token.github_id;
      return session;
    },
  },
});
