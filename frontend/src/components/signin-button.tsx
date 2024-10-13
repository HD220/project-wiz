"use client";

import { LogIn } from "lucide-react";
import { Button } from "./ui/button";
import { signIn } from "next-auth/react";

export function SignInButton() {
  return (
    <Button className="p-2 justify-start" onClick={() => signIn("github")}>
      <LogIn className="w-4 h-4 mr-2" />
      Entrar
    </Button>
  );
}
