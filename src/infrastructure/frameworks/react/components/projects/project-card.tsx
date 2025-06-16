import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress"; // For showing project progress
import { PlaceholderProject } from "@/lib/placeholders";
import { ArrowRight, Settings } from "lucide-react"; // Icons

interface ProjectCardProps {
  project: PlaceholderProject;
  // onNavigateToProject: (projectId: string) => void; // Optional: callback for navigation
}

export function ProjectCard({ project }: ProjectCardProps) {
  // Placeholder progress calculation
  const progressValue = project.status === "Concluído" ? 100 : (project.name.length % 50) + 25; // Example placeholder logic

  const getStatusBadgeVariant = (status: PlaceholderProject["status"]) => {
    switch (status) {
      case "Concluído":
        return "default"; // Or a success variant if defined in Badge
      case "Em Andamento":
        return "secondary";
      case "Pausado":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusBadgeClassName = (status: PlaceholderProject["status"]) => {
     switch (status) {
      case "Concluído":
        return "bg-green-500 text-white";
      case "Em Andamento":
        return "bg-blue-500 text-white";
      case "Pausado":
        return "bg-yellow-500 text-black"; // Ensure contrast
      default:
        return "";
    }
  }

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{project.name}</CardTitle>
          <Badge variant={getStatusBadgeVariant(project.status)} className={getStatusBadgeClassName(project.status)}>
            {project.status}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Última atualização: {new Date(project.lastUpdate).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{project.description}</p>
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progresso</span>
            <span>{progressValue}%</span>
          </div>
          <Progress value={progressValue} aria-label={`Progresso do projeto ${project.name}`} className="h-2" />
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-end space-x-2">
        <Button variant="ghost" size="sm" title="Configurações">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Configurações do Projeto</span>
        </Button>
        <Button variant="outline" size="sm" /* onClick={() => onNavigateToProject(project.id)} */ >
          Ver Detalhes <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
