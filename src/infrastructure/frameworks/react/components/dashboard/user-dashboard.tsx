import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // For potential actions
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // For user display
import { placeholderUserProjects, placeholderUserActivity, PlaceholderProject } from "@/lib/placeholders"; // To be added
import { ProjectCard } from "@/components/projects/project-card";

export function UserDashboard() {
  const userName = "Usuário Exemplo"; // Placeholder
  const userAvatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=user-dashboard"; // Placeholder

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Welcome Section */}
      <section className="flex items-center space-x-4 p-6 bg-card text-card-foreground rounded-lg shadow">
        <Avatar className="h-16 w-16">
          <AvatarImage src={userAvatarUrl} alt={userName} />
          <AvatarFallback>{userName.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold">Bem-vindo de volta, {userName}!</h1>
          <p className="text-muted-foreground">Aqui está um resumo da sua atividade.</p>
        </div>
      </section>

      {/* Projects Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Meus Projetos</h2>
        {placeholderUserProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {placeholderUserProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Você ainda não tem projetos. Crie um para começar!</p>
              <Button className="mt-4">Criar Novo Projeto</Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Recent Activity Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Atividade Recente</h2>
        {placeholderUserActivity.length > 0 ? (
          <Card>
            <CardContent className="p-0"> {/* Remove padding for list items */}
              <ul className="divide-y divide-border">
                {placeholderUserActivity.map((activity) => (
                  <li key={activity.id} className="p-4 hover:bg-muted/50">
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-muted-foreground">{new Date(activity.timestamp).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Nenhuma atividade recente para mostrar.</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Quick Settings/Profile Link (Optional) */}
      <section>
         <Card>
            <CardHeader>
                <CardTitle>Configurações</CardTitle>
            </CardHeader>
            <CardContent>
                <Button variant="outline">Ir para Configurações</Button>
            </CardContent>
         </Card>
      </section>

    </div>
  );
}
