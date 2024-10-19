import { getRepository } from "@/actions/github.actions";
import { H3 } from "@/components/typography/h3";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";
import { TabButton } from "./tab-button";
import { RepositoryConfigForm } from "@/components/forms/repository-config";
import { getRepositoryConfigAction } from "@/actions/repository.actions";

export default async function Page({
  params: {
    repository: [owner, repository],
  },
  searchParams: { tab = "dash" },
}: {
  params: { repository: [string, string] };
  searchParams: { tab: "dash" | "bot" | "context" | "graph" | "config" };
}) {
  const session = await auth();
  const repo = await getRepository(
    session!.user.access_token,
    owner,
    repository
  );
  const repoConfig = await getRepositoryConfigAction(owner, repo.id);

  return (
    <Tabs defaultValue={tab}>
      <TabsList className="flex justify-start gap-2">
        <H3 className="max-w-48 block truncate m-2">
          {repo.name}{" "}
          <span className="text-sm text-muted-foreground">{repo.owner}</span>
        </H3>
        <TabButton value="dash">Dashboard</TabButton>
        <TabButton value="bot">Bots</TabButton>
        <TabButton value="context">Contexto</TabButton>
        <TabButton value="graph">Grafo. Dependência</TabButton>
        <TabButton value="config">Configuração</TabButton>
      </TabsList>
      <TabsContent value="dash">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent className="space-y-2"></CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="bot">
        <Card>
          <CardHeader>
            <CardTitle>Bots</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent className="space-y-2"></CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="context">
        <Card>
          <CardHeader>
            <CardTitle>Contexto</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent className="space-y-2"></CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="graph">
        <Card>
          <CardHeader>
            <CardTitle>Grafo de Dependência</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent className="space-y-2"></CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="config">
        <RepositoryConfigForm
          defaultValues={{
            id: repo.id,
            owner: repo.owner,
            name: repo.name,
            api_token: repoConfig?.api_token || "",
            is_batch_api: repoConfig?.is_batch_api || true,
          }}
        />
      </TabsContent>
    </Tabs>
  );
}
