import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/lib/types';

type ProjectCardProps = {
  project: Project;
  onEdit?: (project: Project) => void;
  onArchive?: (project: Project) => void;
  onUnarchive?: (project: Project) => void;
  onDelete?: (project: Project) => void;
};

export function ProjectCard({
  project,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
}: ProjectCardProps) {
  const isArchived = project.archived_at !== null;

  return (
    <Card className={isArchived ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{project.name}</CardTitle>
            {project.git_url && (
              <a
                href={project.git_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline mt-1 inline-block"
              >
                {project.git_url}
              </a>
            )}
          </div>
          {isArchived && <Badge variant="secondary">Archived</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {project.description && (
          <div>
            <p className="text-sm text-muted-foreground">
              {project.description}
            </p>
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2 pt-4">
          {!isArchived && onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(project)}>
              Edit
            </Button>
          )}
          {!isArchived && onArchive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onArchive(project)}
            >
              Archive
            </Button>
          )}
          {isArchived && onUnarchive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUnarchive(project)}
            >
              Unarchive
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(project)}
            >
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
