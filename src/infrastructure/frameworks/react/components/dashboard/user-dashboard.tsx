import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // For potential actions
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // For user display
import { placeholderUserProjects, placeholderUserActivity, PlaceholderProject } from "@/lib/placeholders"; // To be added
import { ProjectCard } from "@/components/projects/project-card";
import { getInitials } from "@/lib/utils";
import { Trans, t } from "@lingui/macro";
import { ActivityListItem } from "./activity-list-item";

export function UserDashboard() {
  const userName = "Usuário Exemplo"; // Placeholder
  const userAvatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=user-dashboard"; // Placeholder

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Welcome Section */}
      <section className="flex items-center space-x-4 p-6 bg-card text-card-foreground rounded-lg shadow">
        <Avatar className="h-16 w-16">
          <AvatarImage src={userAvatarUrl} alt={userName} />
          <AvatarFallback>{getInitials(userName)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold"><Trans>Bem-vindo de volta, {userName}!</Trans> {/* Lingui: Exemplo com variável. Idealmente usar <Trans id="welcome" values={{ name: userName }} /> */}</h1>
          <p className="text-muted-foreground"><Trans>Aqui está um resumo da sua atividade.</Trans></p>
        </div>
      </section>

      {/* Projects Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4"><Trans>Meus Projetos</Trans></h2>
        {placeholderUserProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {placeholderUserProjects.map((project) => (
              <ProjectCard key={project.id} project={project} onNavigateToProject={(id) => console.log("UserDashboard: Navigate to project:", id)} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground"><Trans>Você ainda não tem projetos. Crie um para começar!</Trans></p>
              <Button className="mt-4"><Trans>Criar Novo Projeto</Trans></Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Recent Activity Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4"><Trans>Atividade Recente</Trans></h2>
        {placeholderUserActivity.length > 0 ? (
          <Card>
            <CardContent className="p-0"> {/* Remove padding for list items */}
              <ul className="divide-y divide-border">
                {placeholderUserActivity.map((activity) => (
                  <ActivityListItem key={activity.id} activity={activity} />
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground"><Trans>Nenhuma atividade recente para mostrar.</Trans></p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Quick Settings/Profile Link (Optional) */}
      <section>
         <Card>
            <CardHeader>
                <CardTitle><Trans>Configurações</Trans></CardTitle>
            </CardHeader>
            <CardContent>
                <Button variant="outline"><Trans>Ir para Configurações</Trans></Button>
            </CardContent>
         </Card>
      </section>

    </div>
  );
}
