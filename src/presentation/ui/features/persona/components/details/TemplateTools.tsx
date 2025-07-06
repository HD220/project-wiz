import {
  BookText,
  Brain,
  Bug,
  Camera,
  Edit3,
  FileText,
  FolderCog,
  ListChecks,
  MessageSquare,
  Palette,
  Presentation,
  SearchCode,
  Settings,
  TerminalSquare,
  TestTubeDiagonal,
} from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const toolIconMap: Record<string, React.ElementType> = {
  filesystem: FolderCog,
  terminal: TerminalSquare,
  codeEditor: Edit3,
  search: SearchCode,
  testRunner: TestTubeDiagonal,
  issueTracker: Bug,
  browserDevTools: Palette,
  taskManager: ListChecks,
  ganttChart: Presentation,
  communicationTools: MessageSquare,
  markdownEditor: FileText,
  documentationGenerator: BookText,
  screenshotTool: Camera,
  gitClient: Settings,
  debugger: Settings,
  apiClient: Settings,
  reportingTool: Settings,
  default: Brain,
};

interface TemplateToolsProps {
  toolNames?: string[];
}

export function TemplateTools({ toolNames }: TemplateToolsProps) {
  if (!toolNames || toolNames.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <TooltipProvider delayDuration={100}>
        {toolNames.map((toolName) => {
          const lookupKey = toolName.replace(/-/g, ' ');
          const IconComponent =
            toolIconMap[lookupKey] ||
            toolIconMap[toolName] ||
            toolIconMap.default;
          return (
            <Tooltip key={toolName}>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="text-sm px-2.5 py-1">
                  <IconComponent className="h-3.5 w-3.5 mr-1.5 opacity-80" />
                  {toolName}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="text-xs p-1.5">
                Ferramenta: {toolName}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
}
