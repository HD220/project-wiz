import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectCard } from './project-card';
import { ProjectForm } from './project-form';
import { useProjectsStore } from '../store';
import { useAuthStore } from '@/features/auth/store';
import type { Project } from '@/lib/types';

export function ProjectList() {
  const { token } = useAuthStore();
  const {
    projects,
    fetchProjects,
    archiveProject,
    unarchiveProject,
    deleteProject,
    isLoading,
  } = useProjectsStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    if (token) {
      fetchProjects(token);
    }
  }, [token, fetchProjects]);

  const handleArchive = async (project: Project) => {
    if (!token) return;

    if (confirm(`Are you sure you want to archive ${project.name}?`)) {
      try {
        await archiveProject(project.id, token);
      } catch (error) {
        console.error('Failed to archive project:', error);
      }
    }
  };

  const handleUnarchive = async (project: Project) => {
    if (!token) return;

    try {
      await unarchiveProject(project.id, token);
    } catch (error) {
      console.error('Failed to unarchive project:', error);
    }
  };

  const handleDelete = async (project: Project) => {
    if (!token) return;

    if (
      confirm(
        `Are you sure you want to permanently delete ${project.name}? This action cannot be undone.`
      )
    ) {
      try {
        await deleteProject(project.id, token);
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
  };

  const handleEditSuccess = () => {
    setEditingProject(null);
  };

  const activeProjects = projects.filter((p) => p.archived_at === null);
  const archivedProjects = projects.filter((p) => p.archived_at !== null);

  if (isLoading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Projects</h2>
          <p className="text-muted-foreground">
            Manage your development projects
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Project</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <ProjectForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-4">No projects yet</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            Create Your First Project
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active">
              Active ({activeProjects.length})
            </TabsTrigger>
            <TabsTrigger value="archived">
              Archived ({archivedProjects.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {activeProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No active projects</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={setEditingProject}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="archived" className="mt-6">
            {archivedProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No archived projects</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {archivedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onUnarchive={handleUnarchive}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      <Dialog
        open={editingProject !== null}
        onOpenChange={(open) => !open && setEditingProject(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          {editingProject && (
            <ProjectForm
              project={editingProject}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingProject(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
