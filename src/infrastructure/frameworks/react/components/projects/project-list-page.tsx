import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlaceholderProject } from "@/lib/placeholders"; // Removed placeholderUserProjects
import { PlusCircle } from "lucide-react"; // Icon for create button
import { ProjectCard } from "@/components/projects/project-card";
import { Trans } from "@lingui/macro";
import { useSyncedProjectList } from "@/hooks/useSyncedProjectList";

export function ProjectListPage() {
  const projects = useSyncedProjectList();
  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold"><Trans>Meus Projetos</Trans></h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> <Trans>Criar Novo Projeto</Trans>
        </Button>
      </header>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} onNavigateToProject={(id) => console.log("ProjectListPage: Navigate to project:", id)} />
          ))}
        </div>
      ) : (
        <Card className="text-center">
          <CardHeader>
            <CardTitle><Trans>Nenhum Projeto Encontrado</Trans></CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              <Trans>Você ainda não tem projetos. Comece criando um novo.</Trans>
            </p>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> <Trans>Criar Primeiro Projeto</Trans>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
