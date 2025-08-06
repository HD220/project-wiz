import { Calendar, Folder, GitBranch, Settings } from "lucide-react";

import type { SelectProject } from "@/shared/types";

import { Badge } from "@/renderer/components/ui/badge";
import { Button } from "@/renderer/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";
import { Separator } from "@/renderer/components/ui/separator";

interface ProjectViewProps {
  project: SelectProject;
}

export function ProjectView(props: ProjectViewProps) {
  const { project } = props;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Project Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-[var(--spacing-component-sm)]">
                <CardTitle className="text-2xl">{project.name}</CardTitle>
                {project.description && (
                  <CardDescription className="text-base">
                    {project.description}
                  </CardDescription>
                )}
              </div>
              <div className="flex items-center space-x-[var(--spacing-component-sm)]">
                <Badge
                  variant={
                    project.status === "active" ? "default" : "secondary"
                  }
                >
                  {project.status === "active" ? "Active" : "Archived"}
                </Badge>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-[var(--spacing-component-md)]">
            {project.localPath && (
              <div className="flex items-center space-x-[var(--spacing-component-md)]">
                <Folder className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Local Path</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {project.localPath}
                  </p>
                </div>
              </div>
            )}

            {project.gitUrl && (
              <div className="flex items-center space-x-[var(--spacing-component-md)]">
                <GitBranch className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Git Repository</p>
                  <p className="text-sm text-muted-foreground break-all">
                    {project.gitUrl}
                  </p>
                  {project.branch && (
                    <p className="text-xs text-muted-foreground">
                      Branch: {project.branch}
                    </p>
                  )}
                </div>
              </div>
            )}

            <Separator />

            <div className="flex items-center space-x-[var(--spacing-component-md)]">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Created on</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(project.createdAt).toLocaleDateString("pt-BR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your project and work with agents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-component-md)]">
              <Button variant="outline" className="justify-start">
                <Folder className="h-4 w-4 mr-2" />
                Open in Explorer
              </Button>
              <Button variant="outline" className="justify-start">
                <GitBranch className="h-4 w-4 mr-2" />
                Sync Repository
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
