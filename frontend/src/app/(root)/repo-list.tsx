import { getUserInstalledRepos } from "@/actions/github.actions";
import { H3 } from "@/components/typography/h3";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollAreaGrab, ScrollBar } from "@/components/ui/scroll-area";
import { Eye } from "lucide-react";
import Link from "next/link";
import { CardBudgetUsage } from "../../components/cards/card-budget-usage";
import { auth } from "@/lib/auth";

export async function RepositoryList({
  q = "",
  owner,
}: {
  q?: string;
  owner: string;
}) {
  const session = await auth();
  const repos = await getUserInstalledRepos(session!.user.access_token, {
    owner: owner,
    search: q,
  });

  return (
    <>
      {repos.length === 0 && (
        <div className="flex flex-1">
          <Card className="w-1/2 mx-auto">
            <CardHeader>
              <CardTitle>Instale o aplicativo</CardTitle>
              <CardDescription>
                Instale o aplicativo na sua conta ou repositórios desejados,
                eles vão aparece aqui!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant={"secondary"} size={"sm"} asChild>
                {/* ?target_id=108767781&target_type=Organization */}
                <Link href="https://github.com/apps/projectwizapp/installations/new">
                  Instalar App
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      {repos.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {repos.map((repo) => (
            <div key={repo.id} className="mb-4">
              <div className="flex items-baseline border-b justify-between mb-4 pb-2">
                <H3>
                  {repo.name}{" "}
                  <span className="text-sm text-muted-foreground">
                    {repo.owner}
                  </span>
                </H3>

                <Link href={`/repository/${owner}/${repo.name}`}>
                  <Button variant="outline" size="icon">
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <ScrollAreaGrab className="w-full pb-3">
                <div className="flex w-max gap-4">
                  <CardBudgetUsage />
                </div>
                <ScrollBar className="" orientation="horizontal" />
              </ScrollAreaGrab>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
