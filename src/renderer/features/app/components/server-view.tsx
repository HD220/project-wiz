import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ServerViewProps {
  serverId: string;
}

export function ServerView({ serverId }: ServerViewProps) {
  // Mock server data - in real app this would come from a store/API
  const getServerData = (id: string) => {
    const servers = {
      server1: {
        name: "Project Alpha",
        description: "Main development project",
        status: "active",
      },
      server2: {
        name: "Team Beta",
        description: "Beta testing environment",
        status: "active",
      },
      server3: {
        name: "Community",
        description: "Community discussions",
        status: "active",
      },
    };
    return (
      servers[id as keyof typeof servers] || {
        name: "Unknown Server",
        description: "Server not found",
        status: "unknown",
      }
    );
  };

  const server = getServerData(serverId);

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{server.name}</CardTitle>
                <CardDescription className="text-base mt-1">
                  {server.description}
                </CardDescription>
              </div>
              <Badge
                variant={server.status === "active" ? "default" : "secondary"}
              >
                {server.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Server ID</h3>
                <p className="text-muted-foreground font-mono">{serverId}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
                <p className="text-muted-foreground">
                  Server-specific content and features will be available here.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
