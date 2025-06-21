import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceholderTeamMember } from "@/lib/placeholders";
import { getInitials } from "@/lib/utils";
import { Trans, t } from "@lingui/macro"; // t for alt text

interface ProjectTeamTabProps {
  teamMembers: PlaceholderTeamMember[] | undefined; // teamMembers can be undefined initially
}

export function ProjectTeamTab({ teamMembers }: ProjectTeamTabProps) {
  return (
    <Card>
      <CardHeader><CardTitle><Trans>Membros da Equipe</Trans></CardTitle></CardHeader>
      <CardContent>
        {teamMembers && teamMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {teamMembers.map(member => (
              <Card key={member.id} className="p-4 flex flex-col items-center text-center">
                <Avatar className="w-16 h-16 mb-2">
                  <AvatarImage src={member.avatarUrl} alt={member.name ? t({ id: "projectTeam.avatarAlt", message: `Avatar de ${member.name}`, values: { name: member.name }}) : t`Avatar de membro da equipe`} />
                  <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                </Avatar>
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground"><Trans>Nenhum membro da equipe atribuído a este projeto.</Trans></p>
        )}
      </CardContent>
       <CardFooter>
          <Button variant="outline" onClick={() => console.warn("TODO: Implement Gerenciar Equipe action")}><Trans>Gerenciar Equipe</Trans></Button>
      </CardFooter>
    </Card>
  );
}
