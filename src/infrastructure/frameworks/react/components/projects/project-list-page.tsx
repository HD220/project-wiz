import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { placeholderUserProjects, PlaceholderProject } from "@/lib/placeholders"; // Using existing placeholders
import { PlusCircle } from "lucide-react"; // Icon for create button
import { ProjectCard } from "@/components/projects/project-card";

export function ProjectListPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Meus Projetos</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Criar Novo Projeto
        </Button>
      </header>

      {placeholderUserProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {placeholderUserProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <Card className="text-center">
          <CardHeader>
            <CardTitle>Nenhum Projeto Encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Você ainda não tem projetos. Comece criando um novo.
            </p>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Criar Primeiro Projeto
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
