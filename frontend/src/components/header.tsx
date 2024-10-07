import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
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
import { signIn } from "@/lib/auth";

export function Header() {
  return (
    <div className="flex items-baseline justify-between mb-6">
      <H1>ProjectWiz</H1>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <User className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuItem>
            <form
              action={async () => {
                "use server";
                await signIn("github");
              }}
            >
              <Button type="submit">Login</Button>
            </form>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href="/billing">Cobrança</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/user/config">Configuração</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href="/logout">Sair</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
