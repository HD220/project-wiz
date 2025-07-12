import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  GitBranch,
  Clock,
  Users,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  FileText,
  Home,
} from "lucide-react";
import {
  mockProjects,
  mockAgents,
  mockTasks,
} from "@/renderer/lib/placeholders";
import { PageTitle } from "@/components/page-title";

export const Route = createFileRoute("/legacy_index")({
  component: HomeComponent,
});

function HomeComponent() {
  const { setMode } = useSidebar();

  useEffect(() => {
    setMode("user");
  }, [setMode]);

  return (
    <div className="flex flex-col flex-1 p-4">
      <PageTitle title="Dashboard" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Project Wiz!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your personal AI-powered software engineering assistant.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/chat">Start a new chat</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/tasks">View your tasks</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/docs">Browse documentation</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {mockTasks.slice(0, 3).map((task) => (
                <li key={task.id} className="flex items-center justify-between">
                  <span className="text-sm">{task.name}</span>
                  <Badge
                    variant={
                      task.status === "completed" ? "default" : "secondary"
                    }
                  >
                    {task.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Current Project:</h3>
                <p className="text-muted-foreground">
                  {mockProjects[0].name} ({mockProjects[0].status})
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Active Agents:</h3>
                <ul className="space-y-1 text-muted-foreground">
                  {mockAgents.map((agent) => (
                    <li key={agent.id}>
                      {agent.name} ({agent.status})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
