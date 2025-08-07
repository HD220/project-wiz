import { Link } from "@tanstack/react-router";
import { ArrowRight, Bot, Folder, Sparkles } from "lucide-react";

import { Badge } from "@/renderer/components/ui/badge";
import { Button } from "@/renderer/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";

export function GettingStartedSection() {
  return (
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
                <h4 className="text-sm font-medium mb-1">AI Agents</h4>
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
                <h4 className="text-sm font-medium mb-1">Project Hub</h4>
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
  );
}
