"use client";

import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { H1 } from "./typography/h1";
import { SiGithub } from "react-icons/si";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { signIn, signOut, useSession } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex items-center justify-between mb-6">
      <H1 className="flex flex-1">
        <Link href={"/"}>ProjectWiz</Link>
      </H1>
      <div className="flex justify-center items-center gap-2">
        <Button variant={"secondary"} size={"sm"} asChild>
          {/* ?target_id=108767781&target_type=Organization */}
          <Link href="https://github.com/apps/projectwizapp/installations/new">
            <SiGithub className="mr-2 h-4 w-4" />
            Instalar App
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Avatar className="rounded-sm w-8 h-8">
                <AvatarImage
                  src={session?.user.image || ""}
                  alt={session?.user.username}
                />
                <AvatarFallback className="rounded-sm w-8 h-8">
                  <User className="rounded-sm w-8 h-8" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {session?.user && (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/billing">Cobrança</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/user/config">
                    <Settings className="mr-2 h-4 w-4" />
                    Configuração
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem
              onClick={() => {
                if (!session?.user) {
                  signIn("github");
                } else {
                  signOut();
                }
              }}
            >
              {!session?.user ? (
                <LogIn className="mr-2 h-4 w-4" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              {!session?.user ? "Entrar" : "Sair"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
