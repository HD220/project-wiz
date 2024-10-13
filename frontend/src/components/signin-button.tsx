"use client";

import { signInAction } from "@/actions/auth.actions";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { LogIn } from "lucide-react";

export function SignInButton() {
  return (
    <DropdownMenuItem
      className="p-2 w-full justify-start"
      onClick={() => signInAction()}
    >
      <LogIn className="w-4 h-4 mr-2" />
      Login
    </DropdownMenuItem>
  );
}
