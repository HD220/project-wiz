import { Button } from "@/components/ui/button";
import { Settings, User } from "lucide-react";
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
import { auth } from "@/lib/auth";
import { SignInButton } from "./signin-button";
import { SignOutButton } from "./signout-button";
import { SiGithub } from "react-icons/si";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export async function Header() {
  const session = await auth();

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
                  src={session!.user.image!}
                  alt={session?.user.username}
                />
                <AvatarFallback>
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            {!session?.user && <SignInButton />}
            {session?.user && (
              <>
                <DropdownMenuSeparator />
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
                <SignOutButton />
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
