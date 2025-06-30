import { Link }
  from '@tanstack/react-router';
// Example icons, removed ExternalLink
import { Star, GitFork, CalendarDays } from 'lucide-react';
import React from 'react';

import { Badge } from '@/presentation/ui/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/presentation/ui/components/ui/card';
import { cn } from '@/presentation/ui/lib/utils';


// Define the ProjectSummary type/interface
export interface ProjectSummary {
  id: string;
  name: string;
  description: string;
  // Could be string or Date object
  lastUpdatedAt?: string | Date;
  tags?: string[];
  // Optional image for the card
  imageUrl?: string;
  // Example additional fields for a more "discord-like" project card feel
  starCount?: number;
  forkCount?: number;
  owner?: {
    name: string;
    avatarUrl?: string;
  };
}

interface ProjectCardProps {
  project: ProjectSummary;
  className?: string;
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  const lastUpdatedText = project.lastUpdatedAt
    ? `Updated ${new Date(project.lastUpdatedAt).toLocaleDateString()}`
    : 'Not updated recently';

  return (
    <Link
      // TanStack Router v1 style path param
      to="/projects/$projectId"
      params={{ projectId: project.id }}
      className={cn("block hover:shadow-lg transition-shadow duration-200 rounded-lg", className)}
    >
      {/* Ensure card itself takes full height of Link */}
      <Card className="h-full flex flex-col">
        {project.imageUrl && (
          <img
            src={project.imageUrl}
            alt={`${project.name} preview`}
            className="w-full h-32 object-cover rounded-t-lg"
          />
        )}
        <CardHeader>
          <CardTitle className="text-lg">{project.name}</CardTitle>
          {project.owner && (
            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1">
              {project.owner.avatarUrl && (
                <img src={project.owner.avatarUrl} alt={project.owner.name} className="w-4 h-4 rounded-full mr-1.5" />
              )}
              <span>{project.owner.name}</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="flex-grow">
          <CardDescription className="text-sm line-clamp-3">{project.description}</CardDescription>
          {project.tags && project.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center pt-4">
          <div className="flex items-center">
            <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
            <span>{lastUpdatedText}</span>
          </div>
          <div className="flex items-center space-x-3">
            {project.starCount !== undefined && (
              <span className="flex items-center">
                <Star className="w-3.5 h-3.5 mr-1" /> {project.starCount}
              </span>
            )}
            {project.forkCount !== undefined && (
              <span className="flex items-center">
                <GitFork className="w-3.5 h-3.5 mr-1" /> {project.forkCount}
              </span>
            )}
            {/* <ExternalLink className="w-4 h-4 hover:text-slate-700 dark:hover:text-slate-300" /> */}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

export default ProjectCard;
