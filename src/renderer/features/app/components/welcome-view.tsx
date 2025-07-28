import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  Folder,
  Plus,
  Sparkles,
  Users,
  Zap,
  Clock,
  Shield,
  Target,
  Home,
  Activity,
  TrendingUp,
  Settings,
  BookOpen,
  MessageSquare,
} from "lucide-react";

import { Badge } from "@/renderer/components/ui/badge";
import { Button } from "@/renderer/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Separator } from "@/renderer/components/ui/separator";
import { useAuth } from "@/renderer/contexts/auth.context";
import { ActivityItem } from "@/renderer/features/app/components/activity-item";

export function WelcomeView() {
  const { user } = useAuth();

  // Get current time for dynamic greeting
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
        ? "Good afternoon"
        : "Good evening";

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 h-0">
        <div className="p-4 space-y-4">
          {/* Compact Welcome Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Home className="size-4 text-primary" />
                <h1 className="text-lg font-semibold text-foreground">
                  {greeting}, {user?.name || "Developer"}!
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Welcome to your AI development workspace
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" asChild>
                <Link to="/user/agents">
                  <Plus className="size-3 mr-1.5" />
                  Create Agent
                </Link>
              </Button>
              <Button size="sm" variant="outline">
                <Folder className="size-3 mr-1.5" />
                New Project
              </Button>
            </div>
          </div>

          <Separator />

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card
              className="group hover:bg-accent/50 transition-colors cursor-pointer"
              asChild
            >
              <Link to="/user/agents">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <Zap className="size-3 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        Quick Start
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Create your first agent
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <div className="group hover:bg-accent/50 transition-colors cursor-pointer">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-blue-500/10">
                      <Folder className="size-3 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">Projects</p>
                      <p className="text-xs text-muted-foreground">
                        Manage workspaces
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="group hover:bg-accent/50 transition-colors cursor-pointer">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-green-500/10">
                      <MessageSquare className="size-3 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        Conversations
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Chat with AI
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card
              className="group hover:bg-accent/50 transition-colors cursor-pointer"
              asChild
            >
              <Link to="/user/settings">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-orange-500/10">
                      <Settings className="size-3 text-orange-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">Settings</p>
                      <p className="text-xs text-muted-foreground">
                        Configure workspace
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Left Column - Feature Cards */}
            <div className="lg:col-span-2 space-y-4">
              {/* Getting Started Section */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" />
                    <CardTitle className="text-base">Getting Started</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      New
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    Set up your AI development environment in minutes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded-md bg-primary/10 mt-0.5">
                          <Bot className="size-3 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-medium mb-1">
                            AI Agents
                          </h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            Create intelligent assistants for development tasks
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-xs"
                            asChild
                          >
                            <Link to="/user/agents">
                              Get Started
                              <ArrowRight className="size-2.5 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded-md bg-blue-500/10 mt-0.5">
                          <Folder className="size-3 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-medium mb-1">
                            Project Hub
                          </h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            Organize and manage development projects
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-xs"
                            asChild
                          >
                            <Link to="/user">
                              View Dashboard
                              <ArrowRight className="size-2.5 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features Overview */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Key Features</CardTitle>
                  <CardDescription className="text-sm">
                    Built for developers, by developers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-start gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors">
                      <div className="p-1 rounded-sm bg-primary/10 mt-0.5">
                        <Clock className="size-3 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Save Time</h4>
                        <p className="text-xs text-muted-foreground">
                          Automate repetitive tasks
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors">
                      <div className="p-1 rounded-sm bg-blue-500/10 mt-0.5">
                        <Shield className="size-3 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Secure</h4>
                        <p className="text-xs text-muted-foreground">
                          Enterprise-grade security
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors">
                      <div className="p-1 rounded-sm bg-green-500/10 mt-0.5">
                        <Target className="size-3 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Precise</h4>
                        <p className="text-xs text-muted-foreground">
                          AI trained for development
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Activity & Stats */}
            <div className="space-y-4">
              {/* Recent Activity */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="size-4 text-primary" />
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    Your latest interactions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ActivityItem
                    icon={<div className="w-2 h-2 bg-green-500 rounded-full" />}
                    title="Successfully logged into Project Wiz"
                    timestamp="Just now"
                    variant="success"
                  />
                  <ActivityItem
                    icon={<div className="w-2 h-2 bg-primary rounded-full" />}
                    title="Welcome! Your workspace is ready"
                    timestamp="Today"
                    variant="info"
                  />
                  <ActivityItem
                    icon={<div className="w-2 h-2 bg-blue-500 rounded-full" />}
                    title="System updated with latest AI models"
                    timestamp="Yesterday"
                    variant="info"
                  />
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground text-center">
                      Create agents and projects to see more activity
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="size-4 text-primary" />
                    <CardTitle className="text-base">Workspace Stats</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Bot className="size-3 text-primary" />
                      <span className="text-sm">AI Agents</span>
                    </div>
                    <span className="text-sm font-medium">0</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Folder className="size-3 text-blue-600" />
                      <span className="text-sm">Projects</span>
                    </div>
                    <span className="text-sm font-medium">0</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="size-3 text-green-600" />
                      <span className="text-sm">Conversations</span>
                    </div>
                    <span className="text-sm font-medium">0</span>
                  </div>
                </CardContent>
              </Card>

              {/* Resources */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="size-4 text-primary" />
                    <CardTitle className="text-base">Resources</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8"
                  >
                    <BookOpen className="size-3 mr-2" />
                    Documentation
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8"
                  >
                    <Users className="size-3 mr-2" />
                    Community
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8"
                  >
                    <MessageSquare className="size-3 mr-2" />
                    Support
                  </Button>
                </CardContent>
              </Card>

              {/* Additional Content for Testing Scroll */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Development Tips</CardTitle>
                  <CardDescription className="text-sm">
                    Best practices for AI-powered development
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded-lg border bg-card">
                    <h4 className="text-sm font-medium mb-2">Start Small</h4>
                    <p className="text-xs text-muted-foreground">
                      Begin with simple agents and gradually increase complexity
                      as you learn the platform.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border bg-card">
                    <h4 className="text-sm font-medium mb-2">Iterate Often</h4>
                    <p className="text-xs text-muted-foreground">
                      Test your agents frequently and refine their prompts based
                      on real-world usage.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border bg-card">
                    <h4 className="text-sm font-medium mb-2">Stay Organized</h4>
                    <p className="text-xs text-muted-foreground">
                      Use projects to group related work and keep your workspace
                      clean.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">System Status</CardTitle>
                  <CardDescription className="text-sm">
                    Platform health and performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-md bg-green-500/10">
                    <span className="text-sm">API Status</span>
                    <Badge
                      variant="outline"
                      className="bg-green-500/20 text-green-700"
                    >
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-md bg-blue-500/10">
                    <span className="text-sm">AI Models</span>
                    <Badge
                      variant="outline"
                      className="bg-blue-500/20 text-blue-700"
                    >
                      Available
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-md bg-orange-500/10">
                    <span className="text-sm">Response Time</span>
                    <span className="text-sm font-medium">~1.2s</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
