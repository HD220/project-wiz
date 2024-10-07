import type { Metadata } from "next";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { inter } from "./fonts";
import { cn } from "@/lib/utils";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Project Wiz",
  description: "Seu assiste de projeto",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(`${inter.variable} antialiased`, "min-h-screen")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="p-4">
            <Header />
            <main className="">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
