import { Bot as BotIcon, UserCircle2 } from 'lucide-react';
import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/ui/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/presentation/ui/components/ui/tooltip';
import { cn } from '@/presentation/ui/lib/utils';

// Assuming types are exported or moved
import type { Participant, StatusIndicatorMap } from './ProjectParticipantsSidebar';

// If statusIndicatorMap is not exported from the main sidebar file,
// it needs to be defined or imported here as well.
// For this example, assuming it's passed as a prop or imported if moved to a shared types file.

interface ParticipantListItemProps {
  participant: Participant;
  // Or import it if defined globally/shared
  statusIndicatorMap: StatusIndicatorMap;
}

export function ParticipantListItem({ participant, statusIndicatorMap }: ParticipantListItemProps) {
  const statusInfo = participant.status ? statusIndicatorMap[participant.status] : null;

  const handleParticipantClick = () => {
    // In a real app, this would navigate to a profile or open a chat, etc.
    alert(`Perfil de ${participant.name} (N/I)`);
  };

  const handleParticipantKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleParticipantClick();
    }
  };

  return (
    <div
      key={participant.id}
      className="flex items-center space-x-3 p-2 hover:bg-slate-200 dark:hover:bg-slate-700/60 rounded-md cursor-pointer"
      onClick={handleParticipantClick}
      onKeyDown={handleParticipantKeyDown}
      role="button"
      tabIndex={0}
    >
      <Avatar className="h-8 w-8 text-xs relative">
        {participant.avatarUrl && <AvatarImage src={participant.avatarUrl} alt={participant.name} />}
        <AvatarFallback className={cn(participant.type === 'agent' ? "bg-emerald-600 dark:bg-emerald-500" : "bg-purple-600 dark:bg-purple-500", "text-white")}>
          {participant.type === 'agent' ? <BotIcon size={14}/> : (participant.name?.substring(0,1).toUpperCase() || <UserCircle2 size={14}/>)}
        </AvatarFallback>
        {statusInfo && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                 <span className={`absolute right-0 bottom-0 block h-2.5 w-2.5 rounded-full ring-1 ring-background ${statusInfo.color}`} />
              </TooltipTrigger>
              <TooltipContent side="left" className="text-xs p-1">
                {statusInfo.icon && <statusInfo.icon className="h-3 w-3 mr-1 inline-block" />}
                {statusInfo.label}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate" title={participant.name}>
          {participant.name}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate" title={participant.roleOrPersona}>
          {participant.roleOrPersona || (participant.type === 'agent' ? 'Agente IA' : 'Membro')}
        </p>
      </div>
    </div>
  );
}
