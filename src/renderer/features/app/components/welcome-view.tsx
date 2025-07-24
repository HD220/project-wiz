import { Badge } from "@/renderer/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";
import { ActivityItem } from "@/renderer/features/app/components/activity-item";
import { useAuth } from "@/renderer/contexts/auth.context";

function WelcomeView() {
  const { user } = useAuth();

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.name || "User"}! 👋
        </h1>
        <p className="text-muted-foreground">
          Ready to start collaborating with AI agents?
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Quick Start</CardTitle>
              <Badge variant="secondary">New</Badge>
            </div>
            <CardDescription>
              Get started with your first AI agent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create your first AI agent and start automating your workflows.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Projects</CardTitle>
            <CardDescription>Manage your development projects</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Organize your code repositories and collaborate with your team.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Community</CardTitle>
            <CardDescription>Connect with other developers</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Join discussions and share knowledge with the community.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest interactions and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <ActivityItem
              icon={<div className="w-2 h-2 bg-green-500 rounded-full" />}
              title="Successfully logged in"
              timestamp="Just now"
              variant="success"
            />
            <ActivityItem
              icon={<div className="w-2 h-2 bg-primary rounded-full" />}
              title="Welcome to Project Wiz!"
              timestamp="Today"
              variant="info"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { WelcomeView };
