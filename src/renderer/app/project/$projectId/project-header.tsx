import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Users, GitBranch, Settings } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description?: string;
  status?: string;
  createdAt?: string;
  avatar?: string;
  memberCount?: number;
  gitUrl?: string;
}

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-500";
      case "paused":
        return "bg-yellow-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={project.avatar} alt={project.name} />
              <AvatarFallback className="text-lg">
                {project.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold">{project.name}</h1>
                {project.status && (
                  <Badge
                    variant="secondary"
                    className={`text-white ${getStatusColor(project.status)}`}
                  >
                    {project.status}
                  </Badge>
                )}
              </div>

              {project.description && (
                <p className="text-muted-foreground max-w-2xl">
                  {project.description}
                </p>
              )}

              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                {project.createdAt && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Created {formatDate(project.createdAt)}</span>
                  </div>
                )}

                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{project.memberCount || 0} members</span>
                </div>

                {project.gitUrl && (
                  <div className="flex items-center space-x-1">
                    <GitBranch className="h-4 w-4" />
                    <span>Connected to Git</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button size="sm">Invite Members</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
