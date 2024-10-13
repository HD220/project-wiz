"use client";

import { SearcInput } from "@/components/search-input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListFilter } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export function DashboardFilters({
  orgs,
}: {
  orgs: {
    id: number;
    name: string;
    url: string;
  }[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const owner = searchParams.get("owner") || session?.user.github_id;

  function handleFilterChange(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value === session?.user.github_id) {
      params.delete("owner");
    } else {
      params.set("owner", value);
    }

    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex justify-center items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <ListFilter className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Filtro
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Filtrar por repositórios</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={owner}
            onValueChange={handleFilterChange}
          >
            <DropdownMenuRadioItem value={session?.user.github_id || ""}>
              {session?.user.username}
            </DropdownMenuRadioItem>
            {orgs.map((org) => (
              <DropdownMenuRadioItem key={org.id} value={org.id.toString()}>
                {org.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <SearcInput />
    </div>
  );
}
