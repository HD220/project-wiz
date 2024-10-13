import type { Metadata } from "next";

import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { inter } from "./fonts";
import { cn } from "@/lib/utils";
import { Header } from "@/components/header";
import { auth } from "@/lib/auth";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Project Wiz",
  description: "Seu assiste de projeto",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(`${inter.variable} antialiased`, "min-h-screen")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider session={session}>
            <div className="p-4">
              <Header />
              <main className="">{children}</main>
            </div>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
