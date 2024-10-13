"use client";

import { signOut } from "next-auth/react";
import { Button } from "./ui/button";

export function SignOutButton() {
  return (
    <Button className="p-2 justify-start" onClick={() => signOut()}>
      Sair
    </Button>
  );
}
