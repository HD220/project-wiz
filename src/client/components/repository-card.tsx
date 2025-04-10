import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Repository } from "@/hooks/use-repository-settings";

interface RepositoryCardProps {
  repo: Repository;
  formatDate: (dateString: string) => string;
}

export function RepositoryCard({ repo, formatDate }: RepositoryCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{repo.name}</CardTitle>
          <Badge variant={repo.status === "active" ? "default" : "secondary"}>
            {repo.status === "active" ? "Active" : "Inactive"}
          </Badge>
        </div>
        <CardDescription>
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {repo.url}
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-2xl font-bold">{repo.issues}</div>
            <div className="text-xs text-muted-foreground">Issues</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{repo.prs}</div>
            <div className="text-xs text-muted-foreground">PRs</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{repo.branches}</div>
            <div className="text-xs text-muted-foreground">Branches</div>
          </div>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          Last synced: {formatDate(repo.lastSync)}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 21h5v-5" />
          </svg>
          Sync
        </Button>
        <Button
          variant={repo.status === "active" ? "destructive" : "default"}
          size="sm"
        >
          {repo.status === "active" ? "Deactivate" : "Activate"}
        </Button>
      </CardFooter>
    </Card>
  );
}