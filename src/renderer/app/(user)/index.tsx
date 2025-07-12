import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  mockProjects,
  mockAgents,
  mockTasks,
} from "@/renderer/lib/placeholders";
import { PageTitle } from "@/components/page-title";

export const Route = createFileRoute("/(user)/")({
  component: UserDashboardPage,
});

export function UserDashboardPage() {
  return (
    <div className="p-4">
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
              <Link to="/">Start a new chat</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/">View your tasks</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/">Browse documentation</Link>
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
                  <span className="text-sm">{task.description}</span>
                  <Badge
                    variant={task.status === "todo" ? "default" : "secondary"}
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
