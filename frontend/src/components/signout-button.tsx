"use client";

import { signOutAction } from "@/actions/auth.actions";
import { DropdownMenuItem } from "./ui/dropdown-menu";

export function SignOutButton() {
  return (
    <DropdownMenuItem
      className="p-2 w-full justify-start"
      onClick={() => signOutAction()}
    >
      Logout
    </DropdownMenuItem>
  );
}
