import { CheckCircle2 } from 'lucide-react'; // Icon for selected state
import React from 'react';

import { Button } from '@/presentation/ui/components/ui/button'; // Will be used if "Select" button per card is desired
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/presentation/ui/components/ui/card';
import { ScrollArea } from '@/presentation/ui/components/ui/scroll-area';
import { cn } from '@/presentation/ui/lib/utils'; // For conditional class names

// Define the Persona type
export interface Persona {
  id: string;
  name: string;
  description: string;
  icon?: React.ElementType; // Placeholder for an icon component or URL string for an image
  tags?: string[];
}

// Define props for the PersonaList component
interface PersonaListProps {
  personas: Persona[];
  selectedPersonaId?: string | null;
  onSelectPersona: (personaId: string) => void;
  className?: string;
  cardClassName?: string;
}

// Placeholder personas data (will be passed as a prop in a real scenario)
const placeholderPersonas: Persona[] = [
  {
    id: 'developer',
    name: 'Software Developer',
    description: 'Helps with coding tasks, debugging, and software design.',
    tags: ['Coding', 'Debugging', 'Development'],
    // icon: Code, // Example if using lucide-react icons directly
  },
  {
    id: 'writer',
    name: 'Content Writer',
    description: 'Assists in writing articles, blog posts, and other content.',
    tags: ['Writing', 'Content Creation', 'Marketing'],
    // icon: FileText,
  },
  {
    id: 'researcher',
    name: 'Researcher',
    description: 'Helps gather information, summarize findings, and analyze data.',
    tags: ['Research', 'Analysis', 'Data'],
    // icon: Search,
  },
  {
    id: 'project_manager',
    name: 'Project Manager',
    description: 'Assists in planning, organizing, and managing project tasks.',
    tags: ['Planning', 'Organization', 'Management'],
    // icon: Briefcase,
  },
];


export function PersonaList({
  personas = placeholderPersonas, // Use placeholder if no personas prop is provided
  selectedPersonaId,
  onSelectPersona,
  className,
  cardClassName,
}: PersonaListProps) {
  return (
    <ScrollArea className={cn("h-[400px] w-full", className)}> {/* Default height, can be overridden */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
        {/* Content for rendering persona items will be added in the next step */}
        {personas.map((persona) => (
          <Card
            key={persona.id}
            onClick={() => onSelectPersona(persona.id)}
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg dark:hover:bg-slate-800/60",
              selectedPersonaId === persona.id
                ? "border-sky-500 dark:border-sky-400 ring-2 ring-sky-500 dark:ring-sky-400 bg-sky-50 dark:bg-sky-900/30"
                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
              cardClassName
            )}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{persona.name}</CardTitle>
                  {persona.icon && <persona.icon className="w-8 h-8 mt-2 text-slate-600 dark:text-slate-400" />}
                </div>
                {selectedPersonaId === persona.id && (
                  <CheckCircle2 className="w-6 h-6 text-sky-500 dark:text-sky-400" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm mb-3">{persona.description}</CardDescription>
              {persona.tags && persona.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {persona.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
            {/* Optionally, a select button within the card if preferred over clicking the whole card
            <CardFooter>
              <Button
                variant={selectedPersonaId === persona.id ? "default" : "outline"}
                className="w-full"
                onClick={(e) => { e.stopPropagation(); onSelectPersona(persona.id); }}
              >
                {selectedPersonaId === persona.id ? "Selected" : "Select"}
              </Button>
            </CardFooter>
            */}
          </Card>
        ))}
        {personas.length === 0 && (
          <p className="col-span-full text-center text-slate-500 dark:text-slate-400 py-10">
            No personas available for selection.
          </p>
        )}
      </div>
    </ScrollArea>
  );
}

export default PersonaList;
