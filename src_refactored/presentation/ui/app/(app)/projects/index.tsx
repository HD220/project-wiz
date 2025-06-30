import { createFileRoute, Link } from '@tanstack/react-router';
import { PlusCircle, LayoutGrid, List } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/presentation/ui/components/ui/button';
import { Input } from '@/presentation/ui/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/ui/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/presentation/ui/components/ui/toggle-group";
import { ProjectList } from '@/presentation/ui/features/project/components/ProjectList';
import { Project } from '@/presentation/ui/features/project/components/ProjectListItem';

const mockProjects: Project[] = [
  { id: '1', name: 'Projeto Phoenix', description: 'Reconstrução da plataforma principal com foco em escalabilidade e IA.', lastActivity: '2 horas atrás', status: 'active', agentCount: 5, taskCount: 23 },
  { id: '2', name: 'Operação Quimera', description: 'Integração de múltiplos serviços legados em uma nova arquitetura de microfrontends.', lastActivity: '1 dia atrás', status: 'paused', agentCount: 2, taskCount: 8 },
  { id: '3', name: 'Iniciativa Netuno', description: 'Desenvolvimento de um novo data lake para análise preditiva de mercado.', lastActivity: '5 dias atrás', status: 'planning', agentCount: 1, taskCount: 2 },
  { id: '4', name: 'Projeto Alpha', description: 'Um projeto de exploração de novas tecnologias de IA.', lastActivity: '3 horas atrás', status: 'active', agentCount: 3, taskCount: 15 },
  { id: '5', name: 'Legado Modernizado', description: 'Atualização de sistema legado para novas tecnologias.', lastActivity: '1 semana atrás', status: 'completed', agentCount: 0, taskCount: 50 },
];


function ProjectsPage() {
  const [projects] = useState<Project[]>(mockProjects);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('name-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredAndSortedProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((projectA, projectB) => {
    if (sortOrder === 'name-asc') return projectA.name.localeCompare(projectB.name);
    if (sortOrder === 'name-desc') return projectB.name.localeCompare(projectA.name);
    // Add more sort options (e.g., by lastActivity)
    return 0;
  });


  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Seus Projetos
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Visualize, gerencie e crie novos projetos de software.
          </p>
        </div>
        <Button asChild>
          <Link to="/projects/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Projeto
          </Link>
        </Button>
      </header>

      {/* Filters and View Options Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
        <Input
          placeholder="Buscar projetos..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="flex-grow sm:flex-grow-0 sm:w-auto md:min-w-[250px]"
        />
        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-full sm:w-auto">
            <SelectValue placeholder="Ordenar por..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Nome (A-Z)</SelectItem>
            <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
            <SelectItem value="activity-desc" disabled>Última Atividade (Recente)</SelectItem>
            <SelectItem value="activity-asc" disabled>Última Atividade (Antiga)</SelectItem>
          </SelectContent>
        </Select>
        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'grid' | 'list')} className="ml-auto">
          <ToggleGroupItem value="grid" aria-label="Visualização em Grade">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="Visualização em Lista">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>


      {filteredAndSortedProjects.length > 0 ? (
        <ProjectList projects={filteredAndSortedProjects} viewMode={viewMode} />
      ) : (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg mt-6">
          <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a15.997 15.997 0 00-4.764 4.648l-3.876 5.814a1.151 1.151 0 001.597 1.597l5.814-3.875a15.996 15.996 0 004.649-4.763m-3.42-3.42a15.995 15.995 0 00a4.5 4.5 0 00-8.4-2.245c0-.399.078-.78.22-1.128"/>
          </svg>
          <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-50">
            {searchTerm ? 'Nenhum projeto encontrado' : 'Nenhum projeto criado'}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {searchTerm ? 'Tente ajustar seus filtros ou termos de busca.' : 'Comece criando seu primeiro projeto.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Button asChild variant="outline">
                <Link to="/projects/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Criar Novo Projeto
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute('/(app)/projects/')({
  component: ProjectsPage,
});
