import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceholderProject } from "@/lib/placeholders";
import { Trans } from "@lingui/macro";

interface ProjectOverviewTabProps {
  project: PlaceholderProject | null; // Project can be null initially
}

export function ProjectOverviewTab({ project }: ProjectOverviewTabProps) {
  if (!project) {
    return null; // Or a loading/empty state specific to this tab
  }

  return (
    <Card>
      <CardHeader><CardTitle><Trans>Detalhes do Projeto</Trans></CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <p><strong><Trans>ID do Projeto:</Trans></strong> {project.id}</p>
        <p><strong><Trans>Nome:</Trans></strong> {project.name}</p>
        <p><strong><Trans>Descrição Completa:</Trans></strong> {project.description}</p>
        {/* Add more detailed overview fields if necessary */}
      </CardContent>
    </Card>
  );
}
