import {
  BookText,
  Brain,
  Edit3,
  MessageSquare,
  Settings,
  Zap,
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
  filesystem: Settings,
  terminal: Settings,
  codeEditor: Edit3,
  search: Settings,
  testRunner: Zap,
  issueTracker: Settings,
  browserDevTools: Settings,
  taskManager: Settings,
  ganttChart: Settings,
  communicationTools: MessageSquare,
  markdownEditor: Edit3,
  documentationGenerator: BookText,
  screenshotTool: Settings,
  default: Brain,
};

interface ListItemToolsProps {
  toolNames: string[];
}

export function ListItemTools({ toolNames }: ListItemToolsProps) {
  if (!toolNames || toolNames.length === 0) {
    return null;
  }
  return (
    <div>
      <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
        Ferramentas:
      </h4>
      <div className="flex flex-wrap gap-1.5">
        <TooltipProvider delayDuration={100}>
          {toolNames.slice(0, 5).map((toolName) => {
            const lookupKey = toolName.replace(/-/g, ' ');
            const IconComponent = toolIconMap[lookupKey] || toolIconMap.default;
            return (
              <Tooltip key={toolName}>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">
                    <IconComponent className="h-3 w-3 mr-1 opacity-70" />
                    {toolName}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="text-xs p-1">
                  {toolName}
                </TooltipContent>
              </Tooltip>
            );
          })}
          {toolNames.length > 5 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="px-1.5 py-0.5 text-xs">
                  +{toolNames.length - 5} mais
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="text-xs p-1">
                {toolNames.slice(5).join(', ')}
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
      </div>
    </div>
  );
}
