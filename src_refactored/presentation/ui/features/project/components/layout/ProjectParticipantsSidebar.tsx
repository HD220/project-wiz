import { Users, Bot as BotIcon, UserCircle2, Search, UserPlus, Shield, Zap, CheckCircle } from 'lucide-react'; // Added UserCircle2 for generic user
import React, { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/ui/components/ui/avatar';
import { Badge } from '@/presentation/ui/components/ui/badge';
import { Button } from '@/presentation/ui/components/ui/button';
import { Input } from '@/presentation/ui/components/ui/input';
import { ScrollArea } from '@/presentation/ui/components/ui/scroll-area';
import { Separator } from '@/presentation/ui/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/presentation/ui/components/ui/tooltip';
import { cn } from '@/presentation/ui/lib/utils';

interface Participant {
  id: string;
  name: string;
  avatarUrl?: string;
  type: 'human' | 'agent';
  roleOrPersona?: string; // e.g., "Project Admin", "Frontend Developer", or "Persona: Code Reviewer"
  status?: 'online' | 'offline' | 'busy' | 'error'; // For agents, could be 'running', 'idle'
}

const mockParticipants: Participant[] = [
  { id: 'user1', name: 'Alice Wonderland', avatarUrl: '/avatars/01.png', type: 'human', roleOrPersona: 'Admin', status: 'online' },
  { id: 'user2', name: 'Bob Construtor', avatarUrl: '/avatars/02.png', type: 'human', roleOrPersona: 'Desenvolvedor', status: 'offline' },
  { id: 'agent001', name: 'CoderBot-Alpha', avatarUrl: '/avatars/agent-coder.png', type: 'agent', roleOrPersona: 'Eng. Software Sênior', status: 'running' },
  { id: 'agent002', name: 'TestMaster-7000', avatarUrl: '/avatars/agent-qa.png', type: 'agent', roleOrPersona: 'Analista de QA', status: 'idle' },
  { id: 'user3', name: 'Charlie Reviewer', type: 'human', roleOrPersona: 'Revisor', status: 'busy' },
  { id: 'agent007', name: 'Deployatron', type: 'agent', roleOrPersona: 'DevOps Specialist', status: 'error'},
];

const statusIndicatorMap: Record<Required<Participant>['status'], { color: string; label: string, icon?: React.ElementType }> = {
  online: { color: 'bg-green-500', label: 'Online', icon: CheckCircle },
  offline: { color: 'bg-slate-400', label: 'Offline' },
  busy: { color: 'bg-yellow-500', label: 'Ocupado' },
  running: { color: 'bg-sky-500', label: 'Executando', icon: Zap }, // Agent specific
  idle: { color: 'bg-slate-500', label: 'Ocioso', icon: Zap },      // Agent specific
  error: { color: 'bg-red-500', label: 'Erro', icon: AlertTriangle }, // Agent specific
};


interface ProjectParticipantsSidebarProps {
  className?: string;
  // projectId: string; // Might be needed to fetch actual participants
}

export function ProjectParticipantsSidebar({ className }: ProjectParticipantsSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  // const { projectId } = props; // If passed

  // In a real app, participants would be fetched based on projectId
  const participants = mockParticipants;

  const filteredParticipants = participants.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.roleOrPersona?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const humanParticipants = filteredParticipants.filter(p => p.type === 'human');
  const agentParticipants = filteredParticipants.filter(p => p.type === 'agent');

  const renderParticipant = (participant: Participant) => {
    const statusInfo = participant.status ? statusIndicatorMap[participant.status] : null;
    return (
      <div key={participant.id} className="flex items-center space-x-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-md cursor-pointer"
           onClick={() => alert(`Abrir perfil/chat com ${participant.name} (N/I)`)}
      >
        <Avatar className="h-8 w-8 text-xs">
          {participant.avatarUrl && <AvatarImage src={participant.avatarUrl} alt={participant.name} />}
          <AvatarFallback className={cn(participant.type === 'agent' ? "bg-emerald-500 text-white" : "bg-purple-500 text-white")}>
            {participant.type === 'agent' ? <BotIcon size={14}/> : participant.name.substring(0,1).toUpperCase() || <UserCircle2 size={14}/>}
          </AvatarFallback>
          {statusInfo && (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                   <span className={`absolute right-0 bottom-0 block h-2.5 w-2.5 rounded-full ring-2 ring-background ${statusInfo.color}`} />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs p-1">
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
  };


  return (
    <aside className={cn("w-64 flex-shrink-0 bg-slate-50 dark:bg-slate-800/50 border-l border-slate-200 dark:border-slate-700 flex flex-col h-full", className)}>
      <header className="p-3 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Participantes do Projeto</h3>
         <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
          <Input
            type="search"
            placeholder="Buscar participantes..."
            className="h-8 pl-9 text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <ScrollArea className="flex-1">
        {humanParticipants.length > 0 && (
          <div className="p-2">
            <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2 mb-1 mt-1 flex items-center">
              <Users className="mr-1.5 h-3.5 w-3.5" /> Membros ({humanParticipants.length})
            </h4>
            <div className="space-y-0.5">
              {humanParticipants.map(renderParticipant)}
            </div>
          </div>
        )}

        {agentParticipants.length > 0 && (
          <div className="p-2">
             {humanParticipants.length > 0 && <Separator className="my-2"/>}
            <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2 mb-1 mt-1 flex items-center">
              <BotIcon className="mr-1.5 h-3.5 w-3.5" /> Agentes IA ({agentParticipants.length})
            </h4>
            <div className="space-y-0.5">
              {agentParticipants.map(renderParticipant)}
            </div>
          </div>
        )}

        {filteredParticipants.length === 0 && (
             <p className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
              {searchTerm ? "Nenhum participante encontrado." : "Nenhum participante neste projeto."}
            </p>
        )}

      </ScrollArea>
       <footer className="p-2 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
            <Button variant="outline" size="sm" className="w-full text-xs">
                <UserPlus className="mr-2 h-3.5 w-3.5"/> Convidar / Adicionar (N/I)
            </Button>
       </footer>
    </aside>
  );
}
