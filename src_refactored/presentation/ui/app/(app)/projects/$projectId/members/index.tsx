import { createFileRoute, useParams } from '@tanstack/react-router';
import { UserPlus, Mail, ShieldCheck, Bot as BotIcon, Trash2 } from 'lucide-react'; // BotIcon to avoid conflict
import { MoreHorizontal } from 'lucide-react';
import React, { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/ui/components/ui/avatar';
import { Badge } from '@/presentation/ui/components/ui/badge';
import { Button } from '@/presentation/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/ui/components/ui/dropdown-menu';
import { Input } from '@/presentation/ui/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/presentation/ui/components/ui/table';


interface Member {
  id: string;
  name: string;
  email?: string;
  role: 'Admin' | 'Membro' | 'Editor' | 'Visualizador';
  avatarUrl?: string;
  type: 'human' | 'agent';
  agentPersona?: string; // If type is 'agent'
}

const mockMembers: Member[] = [
  { id: 'user1', name: 'Alice Wonderland', email: 'alice@example.com', role: 'Admin', avatarUrl: '/avatars/01.png', type: 'human' },
  { id: 'user2', name: 'Bob Construtor', email: 'bob@example.com', role: 'Editor', avatarUrl: '/avatars/02.png', type: 'human' },
  { id: 'agent001', name: 'CoderBot-Alpha', role: 'Membro', type: 'agent', agentPersona: 'Eng. Software Sênior', avatarUrl: '/avatars/agent-coder.png' },
  { id: 'user3', name: 'Charlie Reviewer', email: 'charlie@example.com', role: 'Visualizador', type: 'human' },
  { id: 'agent002', name: 'TestMaster-7000', role: 'Membro', type: 'agent', agentPersona: 'Analista de QA', avatarUrl: '/avatars/agent-qa.png' },
];

// --- Sub-components for ProjectMembersPage ---

interface InviteMemberFormSectionProps {
  projectId: string; // Passed to alert for now
}
function InviteMemberFormSection({ projectId }: InviteMemberFormSectionProps) {
  const [inviteEmail, setInviteEmail] = useState('');
  const handleInviteMember = (event: React.FormEvent) => {
    event.preventDefault();
    if(inviteEmail.trim()){
      alert(`Convite simulado enviado para: ${inviteEmail} (Projeto ID: ${projectId})`);
      setInviteEmail('');
    }
  };
  return (
    <form onSubmit={handleInviteMember} className="flex items-center gap-2 mb-6 pb-6 border-b">
      <Input
        type="email"
        placeholder="Email do novo membro ou ID do Agente"
        value={inviteEmail}
        onChange={(event) => setInviteEmail(event.target.value)}
        className="flex-grow"
      />
      <Button type="submit">
        <UserPlus className="mr-2 h-4 w-4" /> Convidar / Adicionar
      </Button>
    </form>
  );
}

interface MemberTableRowProps {
  member: Member;
}
function MemberTableRow({ member }: MemberTableRowProps) {
  return (
    <TableRow key={member.id}>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7 text-xs">
            {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={member.name} />}
            <AvatarFallback className={member.type === 'agent' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}>
              {member.type === 'agent' ? <BotIcon size={14}/> : member.name.substring(0,1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {member.name}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={member.type === 'agent' ? 'default' : 'secondary'} className={member.type === 'agent' ? 'bg-emerald-600 dark:bg-emerald-500' : ''}>
          {member.type === 'human' ? 'Humano' : 'Agente IA'}
        </Badge>
      </TableCell>
      <TableCell>{member.role}</TableCell>
      <TableCell className="text-xs text-slate-500 dark:text-slate-400">
        {member.type === 'human' ? member.email : `Persona: ${member.agentPersona}`}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <ShieldCheck className="mr-2 h-3.5 w-3.5" /> Alterar Papel (N/I)
            </DropdownMenuItem>
            {member.type === 'human' && member.email &&
              <DropdownMenuItem onClick={() => alert(`Enviar email para ${member.email}`)}>
                <Mail className="mr-2 h-3.5 w-3.5" /> Enviar Email (N/I)
              </DropdownMenuItem>
            }
            <DropdownMenuItem className="text-red-500 focus:text-red-500">
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Remover do Projeto (N/I)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

interface MembersTableSectionProps {
  members: Member[];
}
function MembersTableSection({ members }: MembersTableSectionProps) {
  return (
    <>
      <h3 className="text-lg font-medium mb-3">Lista de Participantes</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Nome / Agente</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Papel no Projeto</TableHead>
            <TableHead>Email / Persona</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <MemberTableRow key={member.id} member={member} />
          ))}
        </TableBody>
      </Table>
      {members.length === 0 && (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-6">
          Nenhum membro ou agente neste projeto ainda.
        </p>
      )}
    </>
  );
}

// --- End Sub-components ---


function ProjectMembersPage() {
  const params = useParams({ from: '/(app)/projects/$projectId/members' });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [members] = useState<Member[]>(mockMembers); // Removed setMembers

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Membros & Agentes do Projeto</CardTitle>
          <CardDescription>
            Gerencie quem tem acesso e quais agentes estão ativos neste projeto (ID: {params.projectId}).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteMemberFormSection projectId={params.projectId} />
          <MembersTableSection members={members} />
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute('/(app)/projects/$projectId/members/')({
  component: ProjectMembersPage,
});
